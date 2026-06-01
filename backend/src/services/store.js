const fs = require('fs');
const path = require('path');
const config = require('../config');
const { writeLog } = require('./notify');
const { sanitizeRow } = require('../utils/sanitize');
const { FIELDS } = require('../constants/apiCodes');

// 인메모리 데이터 스토어 — 기획서 4-1절
// 전체 데이터가 ~352건(1MB 미만)이므로 DB 없이 메모리 + JSON 파일로 충분.
// 검색은 메모리에서 즉시 수행 → 응답시간 500ms 이내 목표 달성 가능.

let _data = [];          // 전체 회수 이력 배열
let _lastUpdated = null; // 마지막 동기화 성공 시각 (ISO string)

/** 서버 시작 시 또는 재시작 시 파일에서 메모리로 로드 */
function loadFromFile() {
  if (!fs.existsSync(config.DATA_FILE)) {
    writeLog('INFO', 'recalls.json 없음 — 빈 스토어로 시작 (초기 동기화 필요)');
    return;
  }
  try {
    const raw = fs.readFileSync(config.DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    // 로드 시 sanitize 재실행 — sanitize 로직이 업데이트되면
    // 캐시 파일을 삭제하지 않아도 새 규칙이 자동 적용됨 (멱등성 보장)
    const rows = Array.isArray(parsed.data) ? parsed.data : [];
    _data = rows.map(sanitizeRow);
    _lastUpdated = parsed.lastUpdated || null;
    writeLog('INFO', `파일 로드 완료: ${_data.length}건, 마지막 업데이트: ${_lastUpdated}`);
  } catch (err) {
    // 파일 손상 시에도 서비스가 계속되도록 빈 스토어로 시작
    writeLog('ERROR', `파일 로드 실패 (빈 스토어로 시작): ${err.message}`);
    _data = [];
    _lastUpdated = null;
  }
}

/** 메모리 데이터를 파일에 저장 */
function saveToFile() {
  const dir = path.dirname(config.DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const payload = JSON.stringify({ lastUpdated: _lastUpdated, data: _data }, null, 2);
  fs.writeFileSync(config.DATA_FILE, payload, 'utf8');
}

/** 전체 데이터 교체 — 초기 전체 동기화 시 사용 */
function replaceAll(rows, updatedAt) {
  _data = rows;
  _lastUpdated = updatedAt;
  saveToFile();
}

/**
 * 증분 데이터 병합 — CRET_DTM 기준 신규 데이터를 추가한다.
 * RTRVLDSUSE_SEQ(일련번호)를 키로 중복을 제거한다.
 * @returns {number} 실제로 추가된 건수
 */
function mergeIncremental(newRows, updatedAt) {
  const existingSeqs = new Set(_data.map(r => r.RTRVLDSUSE_SEQ));
  const added = newRows.filter(r => !existingSeqs.has(r.RTRVLDSUSE_SEQ));
  if (added.length > 0) _data = [..._data, ...added];
  _lastUpdated = updatedAt;
  saveToFile();
  return added.length;
}

function getAll()         { return _data; }
function getLastUpdated() { return _lastUpdated; }
function getCount()       { return _data.length; }

/**
 * 가장 최근에 등록된 제품명 N개 (순수 함수 — 외부 노출해 단위 테스트 가능).
 * CRET_DTM 내림차순 정렬 후 제품명 기준 중복 제거.
 * 빈 제품명은 무시.
 *
 * "낙지젓", "신안새우젓", "멍게젓"처럼 같은 회사가 일괄 등록한 다른 제품들도
 * 모두 추천 후보가 됨 — 동일 제품명만 dedup.
 */
function pickRecentProductNames(rows, limit) {
  const sorted = rows.slice().sort((a, b) => {
    const dA = a[FIELDS.CREATED_AT] || '';
    const dB = b[FIELDS.CREATED_AT] || '';
    return dB.localeCompare(dA);
  });
  const seen = new Set();
  const result = [];
  for (const row of sorted) {
    const name = row[FIELDS.PRODUCT_NAME];
    if (!name || seen.has(name)) continue;
    seen.add(name);
    result.push(name);
    if (result.length >= limit) break;
  }
  return result;
}

/** store 인스턴스 메서드 — 내부 _data를 위 순수 함수로 위임 */
function getRecentProductNames(limit = 3) {
  return pickRecentProductNames(_data, limit);
}

module.exports = {
  loadFromFile, replaceAll, mergeIncremental,
  getAll, getLastUpdated, getCount,
  getRecentProductNames, pickRecentProductNames,
};
