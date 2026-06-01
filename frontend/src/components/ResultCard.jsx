import GradeBadge from './GradeBadge';
import { FIELD } from '../constants/config';
import { gradeNumber } from '../constants/grades';
import { formatCretDtm } from '../utils/formatDate';

// 결과 리스트의 단일 카드 — 식약처 원본 row(필드명 유지)를 받는다.
// 클릭 가능하면 .tap-card로 감싸진다 (부모에서 처리).
export default function ResultCard({ row }) {
  const grade   = gradeNumber(row[FIELD.GRADE]);
  const product = row[FIELD.PRODUCT_NAME] || '';
  const maker   = row[FIELD.MAKER_NAME] || '';
  const reason  = row[FIELD.RECALL_REASON] || '';
  const date    = formatCretDtm(row[FIELD.CREATED_AT]);

  return (
    <article className="result-card">
      <header className="result-card__header">
        <GradeBadge grade={grade} />
        <span className="result-card__date mono">{date}</span>
      </header>
      <div className="result-card__product">{product}</div>
      {reason && <div className="result-card__reason">{reason}</div>}
      {maker && <div className="result-card__maker">{maker}</div>}
    </article>
  );
}
