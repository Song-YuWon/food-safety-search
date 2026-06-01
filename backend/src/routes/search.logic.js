// 검색 라우터의 순수 로직 — Express 의존성 없이 단위 테스트 가능하도록 분리.
//
// 이 모듈은 store나 req/res를 모릅니다. 함수들은 모두 입력 → 출력으로 결정적입니다.
// routes/search.js가 이걸 import해서 사용합니다.

const { FIELDS, GRADES } = require('../constants/apiCodes');

const KIND = {
  DANGER:  'danger',
  CAUTION: 'caution',
  SAFE:    'safe',
};

/** 공백 제거 + 소문자. null/undefined 안전. */
function normalize(str) {
  return String(str ?? '').replace(/\s+/g, '').toLowerCase();
}

/**
 * 검색어를 토큰으로 분해 + 정규화.
 *  "강황가루 진성" → ["강황가루", "진성"]
 *  빈 토큰("") 자동 제거.
 */
function tokenize(raw) {
  return String(raw ?? '').split(/\s+/).map(normalize).filter(Boolean);
}

/**
 * row의 PRDTNM/BSSHNM/BRCDNO 중 어느 한 필드에서라도 모든 토큰이 부분일치하면 매칭.
 * 토큰별로는 OR(필드 어느 하나), 토큰 사이는 AND(모두 만족).
 *
 * **계약**: tokens는 이미 normalize된 상태여야 한다 (소문자, 공백 제거).
 * 일반적으로 호출자가 `tokenize()`로 만든 결과를 넘긴다.
 */
function matchRow(row, tokens) {
  const fields = [
    normalize(row[FIELDS.PRODUCT_NAME] || ''),
    normalize(row[FIELDS.MAKER_NAME]   || ''),
    normalize(row[FIELDS.BARCODE]      || ''),
  ];
  return tokens.every(t => fields.some(f => f.includes(t)));
}

/** 결과 배열의 종합 등급 — 기획서 3-1절 */
function decideKind(results) {
  if (results.length === 0) return KIND.SAFE;
  const hasDanger = results.some(r => {
    const g = r[FIELDS.GRADE];
    return g === GRADES.GRADE_1 || g === GRADES.GRADE_2;
  });
  return hasDanger ? KIND.DANGER : KIND.CAUTION;
}

/** 정렬용 우선순위 (낮을수록 먼저). */
function gradeOrder(row) {
  const g = row[FIELDS.GRADE];
  if (g === GRADES.GRADE_1) return 0;
  if (g === GRADES.GRADE_2) return 1;
  if (g === GRADES.GRADE_3) return 2;
  return 3;
}

/** 등록일 내림차순 → 같은 날이면 위험도 높은 순. 원본 배열 변경 X (slice). */
function sortResults(results) {
  return results.slice().sort((a, b) => {
    const dA = a[FIELDS.CREATED_AT] || '';
    const dB = b[FIELDS.CREATED_AT] || '';
    if (dB !== dA) return dB.localeCompare(dA);
    return gradeOrder(a) - gradeOrder(b);
  });
}

/** 1·2등급(=danger) 건수 카운트 */
function countDanger(results) {
  return results.filter(r => {
    const g = r[FIELDS.GRADE];
    return g === GRADES.GRADE_1 || g === GRADES.GRADE_2;
  }).length;
}

module.exports = {
  KIND, normalize, tokenize, matchRow,
  decideKind, sortResults, countDanger,
};
