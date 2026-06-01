// 날짜 포맷팅 유틸 — 기획서 3-5절
// 홈 화면: "마지막 업데이트: YYYY-MM-DD HH:mm"
// 결과 화면: "오늘 HH:mm 기준" 또는 "데이터 기준 YYYY-MM-DD HH:mm"

const pad = (n) => String(n).padStart(2, '0');

/**
 * 서버에서 내려온 ISO 시각을 "YYYY-MM-DD HH:mm" 로 변환.
 * 잘못된 입력(null, 빈 문자열, 파싱 실패)은 빈 문자열 반환 — 화면에서 분기 처리.
 */
export function formatYmdHm(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 결과 화면 헤더용 — "오늘 HH:mm 기준" 또는 "YYYY-MM-DD HH:mm 기준"
 * 같은 날이면 더 간결한 "오늘" 형식으로.
 */
export function formatResultStamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear()
               && d.getMonth() === now.getMonth()
               && d.getDate() === now.getDate();
  if (sameDay) return `오늘 ${pad(d.getHours())}:${pad(d.getMinutes())} 기준`;
  return `${formatYmdHm(iso)} 기준`;
}

/**
 * 식약처 CRET_DTM → "YYYY.MM.DD" (카드 리스트의 등록일 표시용).
 *
 * 기획서 명세는 "YYYYMMDD"인데, 실제 응답은 Postgres timestamp
 * 형식("YYYY-MM-DD HH:mm:ss.fractional", 길이 21~26)으로 옵니다.
 * 둘 다 안전하게 처리:
 *   1) "-" 포함 → ISO 형식 가정, 정규식으로 YYYY-MM-DD만 추출
 *   2) 8자리 숫자로 시작 → YYYYMMDD 형식
 *   3) 그 외 → 원본 그대로 (방어)
 */
export function formatCretDtm(raw) {
  if (!raw) return '';
  const s = String(raw);

  // ISO 형식: "2026-05-29 13:08:51..." 또는 "2026-05-29T13:08:51"
  if (s.includes('-')) {
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}.${m[2]}.${m[3]}`;
  }

  // YYYYMMDD 형식: "20260521" 또는 "202605211430"
  if (s.length >= 8 && /^\d{8}/.test(s)) {
    return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
  }

  // 알 수 없는 형식 — 원본 그대로 (방어)
  return s;
}
