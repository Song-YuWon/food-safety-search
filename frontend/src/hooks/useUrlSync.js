import { useEffect, useRef } from 'react';

// URL 쿼리스트링과 앱 state 간 단방향 동기화 유틸리티.
//
// 사용 시나리오:
//   · 검색어 입력         → ?q=낙지
//   · 카드 탭 (상세 진입) → ?q=낙지&seq=20230615001 (공유 가능한 링크)
//   · 새로고침            → URL을 읽어 같은 화면 복원
//   · 공유 링크 진입      → 자동으로 검색 + 상세까지 복원
//   · 브라우저 뒤로/앞으로 → popstate 핸들러가 state 복원
//
// pushUrl(history entry 추가)과 replaceUrl(entry 갱신)를 구분해
// 뒤로가기 동작이 자연스러워지도록 한다.

const URL_KEYS = { Q: 'q', SEQ: 'seq' };

/** 현재 URL에서 검색 상태(q, seq) 추출 */
export function readUrlParams() {
  if (typeof window === 'undefined') return { q: '', seq: '' };
  const params = new URLSearchParams(window.location.search);
  return {
    q:   params.get(URL_KEYS.Q)   || '',
    seq: params.get(URL_KEYS.SEQ) || '',
  };
}

/** {q, seq} → "?q=...&seq=..." (값이 없으면 경로만) */
function buildUrl({ q, seq }) {
  const params = new URLSearchParams();
  if (q)   params.set(URL_KEYS.Q, q);
  if (seq) params.set(URL_KEYS.SEQ, seq);
  const qs = params.toString();
  return qs ? `?${qs}` : window.location.pathname;
}

/** 타이핑처럼 자주 일어나는 변경 — history entry 추가하지 않고 현재 entry만 갱신 */
export function replaceUrl(state) {
  if (typeof window === 'undefined') return;
  window.history.replaceState(state, '', buildUrl(state));
}

/** 의도적 네비게이션(추천칩 탭, 카드 탭, 클리어, 뒤로) — entry 추가해 뒤로가기 지원 */
export function pushUrl(state) {
  if (typeof window === 'undefined') return;
  window.history.pushState(state, '', buildUrl(state));
}

/**
 * 브라우저 뒤로/앞으로 버튼 핸들러 등록.
 * handler를 ref에 저장해 매 렌더마다 리스너를 재등록하지 않게 한다.
 */
export function useOnPopState(handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const listener = () => handlerRef.current(readUrlParams());
    window.addEventListener('popstate', listener);
    return () => window.removeEventListener('popstate', listener);
  }, []);
}
