import { forwardRef } from 'react';
import { SearchIcon, CloseIcon } from './icons';
import { APP } from '../constants/messages';

// 검색바 — home/results/detail 모드에 따라 크기 변화는 CSS가 담당.
// 부모(.brand-block.mode-XXX)의 모드 클래스를 상속해 .search-pill, .search-input이 트랜지션됨.
const SearchBar = forwardRef(function SearchBar(
  { value, onChange, onClear, onSubmit, mode }, ref
) {
  const iconSize = mode === 'home' ? 22 : 18;

  return (
    <div className="search-pill">
      <SearchIcon size={iconSize} stroke="var(--text-2)" sw={1.8} />
      <input
        ref={ref}
        type="text"
        className="search-input"
        value={value}
        placeholder={APP.PLACEHOLDER}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button onClick={onClear} className="clear-btn" aria-label={APP.CLEAR_INPUT}>
          <CloseIcon size={10} color="var(--surface)" sw={1.8} />
        </button>
      )}
    </div>
  );
});

export default SearchBar;
