import { formatGradeLabel } from '../constants/messages';

// 등급 배지 — "위험도 N등급". 1·2등급은 빨강, 3등급은 앰버.
// 등급 추출 실패(null) 시 아예 렌더링하지 않음.
export default function GradeBadge({ grade }) {
  if (grade == null) return null;
  const isDanger = grade === 1 || grade === 2;
  const cls = isDanger ? 'grade-badge grade-badge--danger'
                       : 'grade-badge grade-badge--warning';
  return <span className={cls}>{formatGradeLabel(grade)}</span>;
}
