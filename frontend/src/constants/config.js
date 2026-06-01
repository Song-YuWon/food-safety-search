// 프론트엔드 설정값 — 변경하기 쉬운 매직 값들을 한 곳에

// API base URL — 빌드 시점에 VITE_API_BASE 환경변수로 주입.
//   · dev:        빈 문자열 → Vite 프록시(/api/* → localhost:3001) 사용
//   · production: 백엔드 절대 URL (예: "https://food-safety-search-api.onrender.com")
// 끝의 슬래시는 제거해 이중 슬래시 방지.
const RAW_BASE = import.meta.env.VITE_API_BASE || '';
const BASE = RAW_BASE.replace(/\/$/, '');

export const API = {
  SEARCH: `${BASE}/api/search`,
  STATUS: `${BASE}/api/status`,
};

// 로딩 스켈레톤 표시 시간 — README "표시 시간: 700ms"
export const LOADING_DELAY_MS = 700;

// 식약처 원본 필드명 — 백엔드 응답이 원본 그대로 내려옴
export const FIELD = {
  PRODUCT_NAME:  'PRDTNM',
  RECALL_REASON: 'RTRVLPRVNS',
  MAKER_NAME:    'BSSHNM',
  ADDRESS:       'ADDR',
  PHONE:         'TELNO',
  BARCODE:       'BRCDNO',
  PACKAGE_UNIT:  'FRMLCUNIT',
  RECALL_METHOD: 'RTRVLPLANDOC_RTRVLMTHD',
  EXPIRY:        'DISTBTMLMT',
  FOOD_TYPE:     'PRDLST_TYPE',
  IMAGE_URL:     'IMG_FILE_PATH',
  CREATED_AT:    'CRET_DTM',
  SEQ:           'RTRVLDSUSE_SEQ',
  GRADE:         'RTRVL_GRDCD_NM',
  CATEGORY_NAME: 'PRDLST_CD_NM',
};
