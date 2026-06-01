// 사용자에게 노출되는 모든 한국어 문자열을 한 곳에 모은다.
// 새 텍스트가 필요하면 코드에 직접 박지 말고 여기서 추가.

export const APP = {
  TITLE: '안심식품 검색기',
  PLACEHOLDER: '식품명·제조사·바코드',
  LAST_UPDATED_PREFIX: '마지막 업데이트',
  CLEAR_INPUT: '검색어 지우기',
  THEME_TO_DARK:  '다크 모드로 전환',
  THEME_TO_LIGHT: '라이트 모드로 전환',
};

// 이미지 뷰어
export const IMAGE_VIEWER = {
  OPEN_LABEL:  '이미지 크게 보기',
  CLOSE_LABEL: '이미지 닫기',
};

// 면책 안내 — 기획서 + README가 "중복 노출"을 명시. 줄이지 말 것.
export const DISCLAIMER = {
  SHORT: '회수 이력 없음이 절대적 안전을 보증하지 않습니다.',
  DATA_SOURCE: 'DATA · 식품의약품안전처',
  SAFE_EMPHASIZED_HEADER: '그러나, 절대 안전을 보증하지 않습니다',
  SAFE_EMPHASIZED_BODY:
    '식약처 미등록·미신고 사례, 데이터 반영 이전의 사고, ' +
    '개인 알레르기 반응 등은 본 결과에 포함되지 않습니다. ' +
    '제품 라벨과 보관 상태를 함께 확인해 주세요.',
};

// 결과 화면 배너 문구
export const RESULT = {
  DANGER_TITLE: '위험',
  DANGER_SUB: '회수 이력 발견됨',
  CAUTION_TITLE: '주의',
  CAUTION_SUB: '경미한 회수 이력',
  SAFE_TITLE_LINE1: '회수 이력이',
  SAFE_TITLE_LINE2: '확인되지 않았습니다',
  SAFE_SUB: '최근 3년 식약처 데이터 기준',
  STATUS_LABEL: 'STATUS',
  STATUS_TIME_PREFIX: '·',
  LIST_HEADER: '회수·판매중지 이력',
  LIST_ORDER: '최근순',
  EMPTY: '검색된 회수 이력이 없습니다.',
  STATUS_TIME_SUFFIX: '기준',
};

// 결과 카운트 — 함수형으로 분리해 N건 등 인터폴레이션
export const formatCount = ({ total, danger, caution }) => {
  if (danger > 0) return `총 ${total}건 · 1·2등급 ${danger}건`;
  if (caution > 0) return `총 ${total}건 · 3등급 ${caution}건`;
  return `총 ${total}건`;
};

// 상세 화면 메타 라벨
export const DETAIL = {
  TITLE: '안심식품 검색기',
  BACK: '뒤로',
  SHARE: '공유',
  IMAGE_LABEL: '제품 이미지',
  RECALL_INFO: '회수 정보',
  MAKER_INFO: '제조사 정보',
  PRODUCT_INFO: '제품 정보',
  L_REASON: '회수 사유',
  L_GRADE:  '회수 등급',
  L_METHOD: '회수 방법',
  L_REG_DATE: '등록일자',
  L_MAKER: '업체명',
  L_ADDR:  '주소',
  L_PHONE: '전화',
  L_TYPE:  '품목 유형',
  L_PKG:   '포장 단위',
  L_EXP:   '유통/소비기한',
  L_BARCODE: '바코드',
  EMPTY_VALUE: '—',
};

// 등급 안내 시트
export const GRADE_SHEET = {
  TITLE: '위험도 등급 안내',
  OPEN_LABEL: '위험도 등급 안내 열기',
  CLOSE_LABEL: '닫기',
  EXAMPLE_LABEL: '예시',
  FOOTNOTE_PREFIX:
    '본 등급은 식품의약품안전처가 「위해식품등 회수업무 매뉴얼」에 따라 부여한 공식 분류입니다. ',
  FOOTNOTE_EMPHASIS:
    '위험도 1등급이 가장 심각하고 3등급이 비교적 가벼운 위반',
  FOOTNOTE_SUFFIX: '에 해당합니다.',
};

// 추천 칩은 더 이상 정적 상수가 아니라 백엔드 /api/status가 내려주는
// "최근 회수 제품" 동적 데이터로 채워진다 (useStatus.recent → App.jsx).

// 검색 히스토리
export const HISTORY = {
  TITLE: '최근 검색',
  CLEAR_ALL: '모두 지우기',
  REMOVE_ONE: (q) => `${q} 검색 기록 삭제`,
};

// 에러 메시지 — 사용자에게 보이는 한국어
export const ERRORS = {
  NETWORK: '검색 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
  UNKNOWN: '검색 중 오류가 발생했습니다.',
};

// 위험도 라벨 — "위험도 N등급" 접두어 (기획서 3-1절)
export const formatGradeLabel = (grade) => `위험도 ${grade}등급`;
