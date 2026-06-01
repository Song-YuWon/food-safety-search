import ResultBanner from '../components/ResultBanner';
import ResultCard from '../components/ResultCard';
import ResultFooter from '../components/ResultFooter';
import { RESULT } from '../constants/messages';
import { KIND } from '../constants/grades';
import { FIELD } from '../constants/config';
import { DISCLAIMER } from '../constants/messages';
import './ResultsScreen.css';

// 검색 결과 화면 — 백엔드 응답을 그대로 받아 kind에 따라 분기 렌더링.
//  · danger / caution → 컬러 배너 + 리스트 헤더 + 카드 리스트
//  · safe              → 컬러 배너 + 강조된 면책 카드 (리스트 없음)
export default function ResultsScreen({ data, onCardClick, onOpenGradeInfo }) {
  const { kind, total, dangerCount, cautionCount, lastUpdated, results } = data;

  return (
    <div className="results-screen">
      <ResultBanner
        kind={kind}
        total={total}
        danger={dangerCount}
        caution={cautionCount}
        lastUpdated={lastUpdated}
        onOpenGradeInfo={onOpenGradeInfo}
      />

      {kind === KIND.SAFE ? (
        <SafeEmphasized />
      ) : (
        <ResultsList results={results} onCardClick={onCardClick} />
      )}

      <ResultFooter />
    </div>
  );
}

// safe 화면 본문 — 강조된 면책 카드 (절대 안전 보증 X 강조)
function SafeEmphasized() {
  return (
    <section className="safe-emph">
      <header className="safe-emph__header">
        <span className="safe-emph__title">{DISCLAIMER.SAFE_EMPHASIZED_HEADER}</span>
      </header>
      <p className="safe-emph__body">{DISCLAIMER.SAFE_EMPHASIZED_BODY}</p>
    </section>
  );
}

// danger / caution 화면 본문 — 헤더 + 카드 리스트
function ResultsList({ results, onCardClick }) {
  if (results.length === 0) {
    // 방어 코드 — 백엔드가 결과 0건이면 kind를 safe로 내려주지만,
    // 만약 분류 규칙이 바뀌어 danger/caution + 0건이 오면 안내문만 표시.
    return <p className="results-empty">{RESULT.EMPTY}</p>;
  }

  return (
    <>
      <div className="results-header">
        <span className="results-header__title">{RESULT.LIST_HEADER}</span>
        <span className="results-header__order">{RESULT.LIST_ORDER}</span>
      </div>
      <div className="results-list">
        {results.map((row, i) => (
          <div key={row.RTRVLDSUSE_SEQ || i}
               className="tap-card"
               role="button" tabIndex={0}
               onClick={() => onCardClick(i)}
               onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onCardClick(i)}>
            <ResultCard row={row} />
          </div>
        ))}
      </div>
    </>
  );
}
