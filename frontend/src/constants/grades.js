// 등급 관련 상수 — 식약처 원본값 + 종합 등급 + 안내문 데이터
// 화면에 표시할 때는 messages.formatGradeLabel(grade)로 "위험도 N등급" 변환

// 식약처 RTRVL_GRDCD_NM 원본 값
export const GRADE_VALUE = {
  ONE:   '1등급',
  TWO:   '2등급',
  THREE: '3등급',
};

// 종합 등급 — 검색 결과의 최고 위험도 (백엔드와 동일 규칙)
export const KIND = {
  DANGER:  'danger',
  CAUTION: 'caution',
  SAFE:    'safe',
};

// 등급별 카드 부제 — 상세 화면 헤더에 표시
export const GRADE_NOTE = {
  1: '위해성 높음 · 즉시 회수',
  2: '위해성 보통 · 회수 권고',
  3: '표시 누락 · 자진 시정',
};

// 등급 안내 시트 데이터 — 기획서 5-7절 (식약처 「위해식품등 회수업무 매뉴얼」 기준)
export const GRADE_INFO = [
  {
    grade: 1,
    desc:
      '식품의 섭취 또는 사용으로 인해 인체 건강에 미치는 ' +
      '위해 영향이 매우 크거나 중대한 위반행위.',
    examples:
      '무등록·무신고 영업 제품, 알레르기 유발 원료 미표시, ' +
      '벤조피렌·아플라톡신 등 발암물질 검출.',
  },
  {
    grade: 2,
    desc:
      '식품의 섭취 또는 사용으로 인해 인체 건강에 미치는 ' +
      '위해 영향이 크거나 일시적인 경우.',
    examples:
      '황색포도상구균·살모넬라균 등 식중독균 검출, ' +
      '납·니켈 등 중금속 검출.',
  },
  {
    grade: 3,
    desc:
      '식품의 섭취 또는 사용으로 인해 인체 건강에 미치는 ' +
      '위해 영향이 비교적 적은 경우.',
    examples:
      '세균수·대장균·대장균군 등 미생물, 이물(쇳가루), ' +
      '식품첨가물(보존료 등) 기준 위반.',
  },
];

// 등급 → 정수 추출 ('1등급' → 1)
export function gradeNumber(rtrvlGrdcdNm) {
  if (rtrvlGrdcdNm === GRADE_VALUE.ONE)   return 1;
  if (rtrvlGrdcdNm === GRADE_VALUE.TWO)   return 2;
  if (rtrvlGrdcdNm === GRADE_VALUE.THREE) return 3;
  return null;  // 빈 값/미상 — 배지 미표시
}
