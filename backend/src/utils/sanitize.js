// 식약처 API 응답 데이터 정제 — 기획서 4-2절
// 자유 형식 텍스트와 빈 태그가 섞여 있어 저장 전에 정제가 필요하다.

// 식약처가 "정보 없음"을 표현하는 패턴들 — 모두 빈 값으로 통일.
// 실측 데이터(2026-06 기준)에서 raw 응답을 직접 훑어 확인된 케이스:
//   · "데이터없음"    — 기획서 4-2 명시
//   · "-"  (U+002D)   — 일반 하이픈. TELNO, RTRVLPLANDOC_RTRVLMTHD, DISTBTMLMT 등에서 사용
//   · "－" (U+FF0D)   — 전각 하이픈. TELNO에서 발견 (위와 다른 문자임에 주의)
//   · "없음", "표시 없음"  — DISTBTMLMT에서 발견
//   · "무표시", "미표시"   — BRCDNO에서 발견
//   · "무표시제품", "미표시제품" — BRCDNO, DISTBTMLMT에서 발견
//
// 모두 화면 표시 시 "—" (em dash, DETAIL.EMPTY_VALUE)로 자동 폴백된다.
// 새 패턴을 발견하면 이 Set에 한 줄만 추가하면 모든 필드에 자동 적용된다.
const PLACEHOLDER_VALUES = new Set([
  '데이터없음',
  '-', '－',
  '없음', '표시 없음',
  '무표시', '미표시',
  '무표시제품', '미표시제품',
]);

/**
 * 단일 필드 값을 정제한다.
 * - null / undefined → 빈 문자열
 * - placeholder 문자열 → 빈 문자열 (화면에 표시하지 않음)
 * - XML 빈 태그(<BRCDNO/>)가 파서에서 true/false로 파싱되는 경우 → 빈 문자열
 */
function cleanField(value) {
  if (value == null) return '';
  const str = String(value).trim();
  if (str === '' || str === 'true' || str === 'false') return '';
  if (PLACEHOLDER_VALUES.has(str)) return '';
  return str;
}

/**
 * IMG_FILE_PATH는 콤마로 구분된 복수 URL이 올 수 있다.
 * 첫 번째 URL만 사용한다 (기획서 4-2절).
 */
function parseImageUrl(value) {
  const cleaned = cleanField(value);
  if (!cleaned) return '';
  return cleaned.split(',')[0].trim();
}

/**
 * API 응답의 row 객체를 정제해 반환한다.
 * 원본 필드명(PRDTNM 등)은 유지하고 값만 정제.
 */
function sanitizeRow(row) {
  if (!row || typeof row !== 'object') return {};
  const result = {};
  for (const [key, value] of Object.entries(row)) {
    result[key] = key === 'IMG_FILE_PATH'
      ? parseImageUrl(value)
      : cleanField(value);
  }
  return result;
}

module.exports = { cleanField, parseImageUrl, sanitizeRow };
