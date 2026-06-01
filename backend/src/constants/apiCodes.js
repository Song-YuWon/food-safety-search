// 식약처 API 응답 코드 정의 — 기획서 5-5절
// 각 코드별 처리 방침도 함께 기록해 6개월 후에도 맥락 유지

const API_RESPONSE = {
  SUCCESS:           'INFO-000', // 정상
  INVALID_KEY:       'INFO-100', // 인증키 무효 → 동기화 실패 알림
  NO_DATA:           'INFO-200', // 해당 데이터 없음 → 에러 아님, 빈 결과 처리
  RATE_LIMIT:        'INFO-300', // 일일 호출 한도 초과 → 실패 알림 + 내일 재시도
  NO_PERMISSION:     'INFO-400', // 권한 없음 → 실패 알림
  MISSING_PARAM:     'ERROR-300', // 필수값 누락 → 요청 파라미터 점검 (개발 단계 오류)
  INVALID_TYPE:      'ERROR-301', // 파일타입 누락/무효
  SERVICE_NOT_FOUND: 'ERROR-310', // 서비스 ID 오류 (I0490 확인)
  INVALID_START:     'ERROR-331', // startIdx 오류
  INVALID_END:       'ERROR-332', // endIdx 오류
  END_LESS_START:    'ERROR-334', // endIdx < startIdx
  OVER_1000:         'ERROR-336', // 1,000건 초과 요청 → 페이지 분할 필요
  SERVER_ERROR:      'ERROR-500', // 식약처 서버 오류 → 실패 알림 + 내일 재시도
  SQL_ERROR:         'ERROR-601', // SQL 오류 → 실패 알림
};

// Discord 알림이 필요한 실패 코드
const ALERT_CODES = new Set([
  API_RESPONSE.INVALID_KEY,
  API_RESPONSE.RATE_LIMIT,
  API_RESPONSE.NO_PERMISSION,
  API_RESPONSE.SERVER_ERROR,
  API_RESPONSE.SQL_ERROR,
]);

// 식약처 응답 XML 필드명 — 기획서 5-4절
const FIELDS = {
  PRODUCT_NAME:  'PRDTNM',
  RECALL_REASON: 'RTRVLPRVNS',
  MAKER_NAME:    'BSSHNM',
  ADDRESS:       'ADDR',
  PHONE:         'TELNO',
  BARCODE:       'BRCDNO',
  PACKAGE_UNIT:  'FRMLCUNIT',
  MFG_DATE:      'MNFDT',
  RECALL_METHOD: 'RTRVLPLANDOC_RTRVLMTHD',
  EXPIRY:        'DISTBTMLMT',
  FOOD_TYPE:     'PRDLST_TYPE',
  IMAGE_URL:     'IMG_FILE_PATH',
  PRODUCT_CODE:  'PRDLST_CD',
  CREATED_AT:    'CRET_DTM',
  SEQ:           'RTRVLDSUSE_SEQ',
  REPORT_NO:     'PRDLST_REPORT_NO',
  GRADE:         'RTRVL_GRDCD_NM',   // "1등급" / "2등급" / "3등급"
  CATEGORY_NAME: 'PRDLST_CD_NM',
  LICENSE_NO:    'LCNS_NO',
};

// 등급 원본값 — 저장 시 그대로, 화면 표시 시 "위험도" 접두어 붙임 (기획서 3-1절)
const GRADES = {
  GRADE_1: '1등급',
  GRADE_2: '2등급',
  GRADE_3: '3등급',
};

module.exports = { API_RESPONSE, ALERT_CODES, FIELDS, GRADES };
