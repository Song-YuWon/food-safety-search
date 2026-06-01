import { useEffect, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultSkeleton from './components/ResultSkeleton';
import GradeInfoSheet from './components/GradeInfoSheet';
import ThemeToggle from './components/ThemeToggle';
import SearchHistory from './components/SearchHistory';
import ResultsScreen from './screens/ResultsScreen';
import DetailScreen from './screens/DetailScreen';
import { LiveDot } from './components/icons';
import { APP, DISCLAIMER } from './constants/messages';
import { FIELD } from './constants/config';
import { formatYmdHm } from './utils/formatDate';
import useSearch from './hooks/useSearch';
import useStatus from './hooks/useStatus';
import useTheme from './hooks/useTheme';
import useSearchHistory from './hooks/useSearchHistory';
import { readUrlParams, replaceUrl, pushUrl, useOnPopState } from './hooks/useUrlSync';

// 검색 히스토리 저장 디바운스 — 타이핑 중간값("낙", "낙지") 모두 저장되지 않게.
// 마지막 키 입력 후 이 시간 동안 변화 없으면 저장.
const HISTORY_DEBOUNCE_MS = 1200;

// URL 쿼리에서 초기 mode 결정 — q 없으면 home, seq까지 있으면 detail
function initialMode({ q, seq }) {
  if (!q) return 'home';
  return seq ? 'detail' : 'results';
}

export default function App() {
  // 초기 state는 URL 쿼리에서 추출 — 새로고침 / 공유 링크 진입 시 같은 화면 복원
  const initial = readUrlParams();
  const [mode, setMode] = useState(initialMode(initial));
  const [query, setQuery] = useState(initial.q);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [pendingSeq, setPendingSeq] = useState(initial.seq);  // 결과 도착 후 SEQ→idx 매핑용
  const [sheetOpen, setSheetOpen] = useState(false);
  const inputRef = useRef(null);

  const { data, isLoading, error, runSearch, reset } = useSearch();
  const { lastUpdated: bootLastUpdated, recent } = useStatus();
  const { isDark, toggle: toggleTheme } = useTheme();
  const history = useSearchHistory();

  // 마운트 시 URL에 q가 있으면 자동 검색 (공유 링크 / 새로고침 진입)
  useEffect(() => {
    if (initial.q) runSearch(initial.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // 1회만

  // 검색어 디바운스 — 1.2초 동안 query 변화 없으면 히스토리에 저장.
  // results 모드에서만 동작 — home/detail에서는 의미 없음.
  // "낙" → "낙지" 처럼 빠르게 바뀌면 중간값은 cleanup으로 취소되고 마지막만 저장.
  useEffect(() => {
    if (mode !== 'results' || !query.trim()) return;
    const t = setTimeout(() => history.add(query), HISTORY_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query, mode, history.add]);

  // 결과 도착 후 pendingSeq → selectedIdx 매핑
  // (초기 마운트, popstate 양쪽에서 사용)
  useEffect(() => {
    if (!pendingSeq || !data?.results) return;
    const idx = data.results.findIndex(r => r[FIELD.SEQ] === pendingSeq);
    if (idx >= 0) {
      setSelectedIdx(idx);
    } else if (mode === 'detail') {
      // 잘못된 SEQ 링크 — 결과만 보여줌
      setMode('results');
    }
    setPendingSeq('');
  }, [data, pendingSeq, mode]);

  // ─── 사용자 액션 핸들러 ────────────────────────────────
  // 타이핑(자주 변경) → replaceState
  // 의도적 액션(추천 칩/카드 탭/클리어/뒤로) → pushState 로 history entry 추가

  const onChange = (v) => {
    setQuery(v);
    if (v.trim() === '') {
      if (mode !== 'home') setMode('home');
      reset();
      // 타이핑으로 빈 문자열이 되는 케이스는 replace (history 폭증 방지).
      // 명시적 clear 버튼 / 추천칩만 push로 entry 추가.
      replaceUrl({});
    } else {
      // 홈 → 결과 첫 진입 시 한 번 push해서 홈 entry를 history에 보존.
      // 그래야 결과 화면에서 브라우저 뒤로 버튼이 홈으로 복귀시킨다.
      // 그 이후 타이핑은 replace로 처리해 history가 폭증하지 않게 한다.
      if (mode === 'home') {
        setMode('results');
        pushUrl({ q: v });
      } else {
        replaceUrl({ q: v });
      }
      runSearch(v);
    }
  };

  const onClear = () => {
    setQuery('');
    setMode('home');
    reset();
    pushUrl({});
    inputRef.current?.blur();
  };

  const onSubmit = () => {
    if (query.trim() && mode === 'home') {
      setMode('results');
      runSearch(query);
      pushUrl({ q: query });
      history.add(query);   // Enter = 의도적 검색 — 즉시 저장
    }
  };

  const onSuggestion = (q) => {
    setQuery(q);
    setMode('results');
    runSearch(q);
    pushUrl({ q });
    history.add(q);         // 추천 칩 / 히스토리 칩 클릭 — 맨 앞으로 (LRU 갱신)
  };

  const onCardClick = (i) => {
    setSelectedIdx(i);
    setMode('detail');
    const seq = data?.results?.[i]?.[FIELD.SEQ] || '';
    pushUrl({ q: query, seq });
    history.add(query);     // 카드 탭 = "이 검색이 유의미했다" — 즉시 저장
  };

  const onBackToList = () => {
    setMode('results');
    pushUrl({ q: query });
  };

  // ─── 브라우저 뒤로/앞으로 ──────────────────────────────
  useOnPopState((urlState) => {
    setQuery(urlState.q);
    if (!urlState.q) {
      setMode('home');
      reset();
      return;
    }
    setMode(urlState.seq ? 'detail' : 'results');
    runSearch(urlState.q);
    if (urlState.seq) setPendingSeq(urlState.seq);
  });

  const showResults = mode === 'results' || mode === 'detail';
  const displayLastUpdated = data?.lastUpdated || bootLastUpdated;

  return (
    <div className="app">
      <div className={`phone mode-${mode}`}>
        {/* 다크/라이트 토글 — 우상단 고정. 상세 화면은 자체 navbar에 별도 토글이 보임. */}
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />

        <div className={`results-shell ${showResults ? 'visible' : 'hidden'}`}>
          {error && <p className="app-error">{error}</p>}
          {isLoading && <ResultSkeleton />}
          {!isLoading && !error && data && (
            <ResultsScreen
              data={data}
              onCardClick={onCardClick}
              onOpenGradeInfo={() => setSheetOpen(true)}
            />
          )}
        </div>

        <div className={`brand-block mode-${mode}`}>
          <div className="wordmark">{APP.TITLE}</div>
          <div className="meta-line">
            <LiveDot />
            <span>
              {APP.LAST_UPDATED_PREFIX}{' '}
              <span className="mono">{formatYmdHm(displayLastUpdated) || '—'}</span>
            </span>
          </div>
          <SearchBar
            ref={inputRef}
            value={query}
            mode={mode}
            onChange={onChange}
            onClear={onClear}
            onSubmit={onSubmit}
          />
          <p className="disclaimer-line">{DISCLAIMER.SHORT}</p>
          <SearchHistory
            items={history.items}
            onSelect={onSuggestion}
            onRemove={history.remove}
            onClear={history.clear}
          />
          {/* 추천 칩 — 백엔드가 내려주는 최근 회수 제품 3개 (매일 04:00 갱신) */}
          <div className="suggestions">
            {recent.map(s => (
              <button key={s} onClick={() => onSuggestion(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className={`detail-sheet ${mode === 'detail' ? 'open' : ''}`}
             aria-hidden={mode !== 'detail'}>
          <DetailScreen
            row={data?.results?.[selectedIdx]}
            onBack={onBackToList}
            onOpenGradeInfo={() => setSheetOpen(true)}
            isDark={isDark}
            toggleTheme={toggleTheme}
          />
        </div>

        <GradeInfoSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
      </div>
    </div>
  );
}
