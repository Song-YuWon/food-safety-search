import { AlertTriIcon, CheckCircleIcon, InfoIcon } from './icons';
import GradeInfoButton from './GradeInfoButton';
import { RESULT, formatCount } from '../constants/messages';
import { KIND } from '../constants/grades';
import { formatResultStamp } from '../utils/formatDate';
import './ResultBanner.css';

// 결과 화면 상단의 컬러 배너 — kind에 따라 위험/주의/안전 분기.
// safe만 레이아웃이 다름(아이콘 위, 텍스트 아래) → 별도 분기 처리.
export default function ResultBanner({ kind, total, danger, caution, lastUpdated, onOpenGradeInfo }) {
  const stamp = formatResultStamp(lastUpdated);

  if (kind === KIND.SAFE) {
    return (
      <section className="banner banner--safe">
        <div className="banner__icon banner__icon--lg">
          <CheckCircleIcon size={30} color="#fff" sw={2.2} />
        </div>
        <div className="banner__status">
          <span className="banner__status-text">
            {RESULT.STATUS_LABEL}
            <span className="mono banner__stamp"> · {stamp}</span>
          </span>
          <GradeInfoButton onClick={onOpenGradeInfo} variant="on-color" size={26} />
        </div>
        <div className="banner__verdict banner__verdict--safe">
          {RESULT.SAFE_TITLE_LINE1}<br />{RESULT.SAFE_TITLE_LINE2}
        </div>
        <div className="banner__sub banner__sub--safe">
          <span className="banner__sub-dot" />
          {RESULT.SAFE_SUB}
        </div>
      </section>
    );
  }

  // danger / caution — 좌측 아이콘 + 우측 컬럼 레이아웃
  const isDanger = kind === KIND.DANGER;
  return (
    <section className={`banner ${isDanger ? 'banner--danger' : 'banner--caution'}`}>
      <div className="banner__icon">
        {isDanger
          ? <AlertTriIcon size={22} color="#fff" sw={2} />
          : <InfoIcon size={22} color="#fff" sw={2} />}
      </div>
      <div className="banner__column">
        <div className="banner__status">
          <span className="banner__status-text">
            {RESULT.STATUS_LABEL}
            <span className="mono banner__stamp"> · {stamp}</span>
          </span>
          <GradeInfoButton onClick={onOpenGradeInfo} variant="on-color" size={26} />
        </div>
        <div className="banner__verdict">
          {isDanger ? RESULT.DANGER_TITLE : RESULT.CAUTION_TITLE}
        </div>
        <div className="banner__sub">
          {isDanger ? RESULT.DANGER_SUB : RESULT.CAUTION_SUB}
        </div>
        <div className="banner__count">
          {formatCount({ total, danger, caution })}
        </div>
      </div>
    </section>
  );
}
