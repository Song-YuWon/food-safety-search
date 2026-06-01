import { ClockIcon, CloseIcon } from './icons';
import { HISTORY } from '../constants/messages';
import './SearchHistory.css';

// 홈 화면의 "최근 검색" 섹션.
// 항목이 없으면 컨테이너 자체를 렌더링하지 않아 추천 칩만 보이게 한다.
// 각 칩 = [시계 아이콘 + 검색어] 본체 버튼 + [X] 개별 삭제 버튼.
export default function SearchHistory({ items, onSelect, onRemove, onClear }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="history">
      <header className="history__header">
        <span className="history__title">{HISTORY.TITLE}</span>
        <button type="button" onClick={onClear} className="history__clear">
          {HISTORY.CLEAR_ALL}
        </button>
      </header>
      <div className="history__chips">
        {items.map(q => (
          <div key={q} className="history__chip">
            <button type="button"
                    onClick={() => onSelect(q)}
                    className="history__chip-main">
              <ClockIcon size={11} color="var(--text-3)" sw={1.6} />
              <span>{q}</span>
            </button>
            <button type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(q); }}
                    aria-label={HISTORY.REMOVE_ONE(q)}
                    className="history__chip-x">
              <CloseIcon size={8} color="var(--text-3)" sw={1.6} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
