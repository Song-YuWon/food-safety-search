import { useCallback, useState } from 'react';

// 검색 히스토리 — localStorage에 최근 검색어 5개를 LRU로 보관.
//
// 의도:
//   · 계정 없이도 사용자가 자주 보는 제품을 빠르게 재검색
//   · 중복 검색어는 항상 맨 앞으로 (이미 있으면 위치만 갱신)
//   · 시크릿 모드 / localStorage 거부 환경에서는 메모리 상태로만 동작
//
// 저장 형식: JSON 배열 (가장 최근이 [0])

export const STORAGE_KEY = 'food-safety:history';
export const MAX_ITEMS = 5;

// ─── 순수 함수 (테스트하기 쉽도록 분리) ───────────────────

/** LRU 추가 — 같은 검색어가 있으면 제거 후 맨 앞으로. 빈 값은 무시. */
export function addToHistory(prev, rawQuery, max = MAX_ITEMS) {
  const q = (rawQuery || '').trim();
  if (!q) return prev;
  return [q, ...prev.filter(x => x !== q)].slice(0, max);
}

/** 특정 검색어 1개 삭제. */
export function removeFromHistory(prev, q) {
  return prev.filter(x => x !== q);
}

// ─── storage I/O ──────────────────────────────────────

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
  } catch {
    // JSON 파싱 실패 or storage 접근 거부 — 무시
    return [];
  }
}

function saveToStorage(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // 용량 초과 / 거부 — 메모리 상태는 그대로 유지하고 무시
  }
}

// ─── React 훅 (위 순수 함수 + storage I/O 결합) ────────

export default function useSearchHistory() {
  const [items, setItems] = useState(loadFromStorage);

  // add는 useCallback으로 안정화 — App.jsx의 디바운스 useEffect deps로 안전하게 들어감
  const add = useCallback((q) => {
    setItems(prev => {
      const next = addToHistory(prev, q);
      saveToStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((q) => {
    setItems(prev => {
      const next = removeFromHistory(prev, q);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    saveToStorage([]);
  }, []);

  return { items, add, remove, clear };
}
