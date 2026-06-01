import { useEffect, useRef, useState } from 'react';
import { API, LOADING_DELAY_MS } from '../constants/config';
import { KIND } from '../constants/grades';
import { ERRORS } from '../constants/messages';

// 검색 훅 — 입력 변경/제출 시 백엔드 호출.
// 디바운스 + 최소 표시 시간 700ms (스켈레톤이 깜빡이는 것 방지).
//
// 반환값:
//  · data: { kind, total, dangerCount, cautionCount, lastUpdated, results } | null
//  · isLoading: 스켈레톤 표시 여부
//  · error: 사용자에게 보여줄 에러 메시지 | null
//  · runSearch: (query) => void — 명시적 검색 트리거
//  · reset:     () => void — 결과 비우기
export default function useSearch() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);  // 이전 요청 취소용
  const timerRef = useRef(null);

  // unmount 시 진행 중인 요청/타이머 정리
  useEffect(() => () => {
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const reset = () => {
    abortRef.current?.abort();
    if (timerRef.current) clearTimeout(timerRef.current);
    setData(null);
    setIsLoading(false);
    setError(null);
  };

  const runSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) { reset(); return; }

    // 이전 요청 취소 → 최신 입력만 반영
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    const startedAt = Date.now();
    fetch(`${API.SEARCH}?q=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        // 스켈레톤 최소 표시 시간 보장 — 너무 빨리 끝나면 깜빡임
        const elapsed = Date.now() - startedAt;
        const wait = Math.max(0, LOADING_DELAY_MS - elapsed);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setData(json);
          setIsLoading(false);
        }, wait);
      })
      .catch(err => {
        // AbortError는 의도된 취소 — 에러 표시 X
        if (err.name === 'AbortError') return;
        setError(ERRORS.NETWORK);
        setIsLoading(false);
      });
  };

  return { data, isLoading, error, runSearch, reset };
}
