const { XMLParser } = require('fast-xml-parser');
const fetch = require('node-fetch');
const config = require('../config');
const store = require('./store');
const { sanitizeRow } = require('../utils/sanitize');
const { logSyncSuccess, logSyncFailure, writeLog } = require('./notify');
const { API_RESPONSE } = require('../constants/apiCodes');

// XML 파서 — 속성 무시, 숫자 자동 변환 비활성화 (바코드 등 선행 0 손실 방지)
const parser = new XMLParser({ ignoreAttributes: true, parseTagValue: false });

/** 식약처 API URL 조립 — 기획서 5-2절 */
function buildUrl(startIdx, endIdx, cretDtm) {
  const { FOODSAFETY_API_KEY, FOODSAFETY_BASE_URL, FOODSAFETY_SERVICE_ID } = config;
  let url = `${FOODSAFETY_BASE_URL}/${FOODSAFETY_API_KEY}/${FOODSAFETY_SERVICE_ID}/xml/${startIdx}/${endIdx}`;
  if (cretDtm) url += `/CRET_DTM=${cretDtm}`;
  return url;
}

/**
 * API 한 페이지 요청 → 파싱된 rows 반환
 * @returns {{ rows: object[], totalCount: number }}
 */
async function fetchPage(startIdx, endIdx, cretDtm) {
  const url = buildUrl(startIdx, endIdx, cretDtm);
  // 로그에는 키를 마스킹
  writeLog('INFO', `API 요청: ${url.replace(config.FOODSAFETY_API_KEY, '***KEY***')}`);

  const res = await fetch(url, { timeout: 30000 });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const root = parsed['I0490'];
  if (!root) throw new Error('응답 루트(I0490) 없음 — API 구조 변경 가능성');

  const code = root?.RESULT?.CODE;
  const totalCount = parseInt(root?.total_count || '0', 10);

  if (code === API_RESPONSE.NO_DATA) {
    return { rows: [], totalCount: 0 };
  }
  if (code !== API_RESPONSE.SUCCESS) {
    const err = new Error(`API 오류 코드: ${code} — ${root?.RESULT?.MSG || ''}`);
    err.apiCode = code;
    throw err;
  }

  // row가 단건이면 파서가 배열 대신 객체를 반환하므로 배열로 감쌈
  let rows = root?.row ?? [];
  if (!Array.isArray(rows)) rows = [rows];

  return { rows: rows.map(sanitizeRow), totalCount };
}

/** 전체 데이터 다운로드 (페이지 순회) — 서버 최초 기동 시 실행 */
async function syncFull() {
  const startMs = Date.now();
  writeLog('INFO', '=== 전체 동기화 시작 ===');

  try {
    const pageSize = config.FOODSAFETY_PAGE_SIZE;
    const first = await fetchPage(1, pageSize, null);
    let allRows = [...first.rows];
    const total = first.totalCount;
    writeLog('INFO', `전체 건수: ${total}건 — 첫 페이지 ${first.rows.length}건 수신`);

    let startIdx = pageSize + 1;
    while (startIdx <= total) {
      const endIdx = Math.min(startIdx + pageSize - 1, total);
      const page = await fetchPage(startIdx, endIdx, null);
      allRows = [...allRows, ...page.rows];
      writeLog('INFO', `진행 중: ${allRows.length}/${total}건`);
      startIdx += pageSize;
    }

    const now = new Date().toISOString();
    store.replaceAll(allRows, now);
    await logSyncSuccess({ type: '전체', count: allRows.length, durationMs: Date.now() - startMs });
    return { ok: true, count: allRows.length };

  } catch (err) {
    await logSyncFailure({ type: '전체', reason: err.message, code: err.apiCode });
    return { ok: false, error: err.message };
  }
}

/** 증분 동기화 — CRET_DTM 기준 어제 이후 신규 데이터만 추가 */
async function syncIncremental() {
  const startMs = Date.now();

  // 어제 날짜를 YYYYMMDD 형식으로 — 당일 등록분도 포함하기 위해 하루 여유
  const yesterday = new Date(Date.now() - 86400 * 1000);
  const cretDtm = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
  writeLog('INFO', `=== 증분 동기화 시작 (CRET_DTM >= ${cretDtm}) ===`);

  try {
    const pageSize = config.FOODSAFETY_PAGE_SIZE;
    const first = await fetchPage(1, pageSize, cretDtm);
    let newRows = [...first.rows];

    let startIdx = pageSize + 1;
    while (startIdx <= first.totalCount) {
      const endIdx = Math.min(startIdx + pageSize - 1, first.totalCount);
      const page = await fetchPage(startIdx, endIdx, cretDtm);
      newRows = [...newRows, ...page.rows];
      startIdx += pageSize;
    }

    const now = new Date().toISOString();
    const added = store.mergeIncremental(newRows, now);
    await logSyncSuccess({ type: '증분', count: added, durationMs: Date.now() - startMs });
    return { ok: true, added };

  } catch (err) {
    await logSyncFailure({ type: '증분', reason: err.message, code: err.apiCode });
    return { ok: false, error: err.message };
  }
}

module.exports = { syncFull, syncIncremental };
