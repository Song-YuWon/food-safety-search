// 라벨↔값 행 — 상세 화면에서 반복 사용.
// value는 문자열 또는 ReactNode 모두 허용 (등급 행에 ? 버튼 inline 등).
export default function MetaRow({ label, value, isLast = false }) {
  const cls = isLast ? 'meta-row meta-row--last' : 'meta-row';
  return (
    <div className={cls}>
      <span className="meta-row__label">{label}</span>
      <span className="meta-row__value">{value}</span>
    </div>
  );
}
