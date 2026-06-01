import { useEffect, useState } from 'react';

// 다크/라이트 토글 훅 — `<html data-theme="...">` 속성을 토글한다.
//
// 우선순위:
//   1. localStorage에 사용자가 명시적으로 선택한 값이 있으면 그걸 사용
//   2. 없으면 OS의 prefers-color-scheme을 따른다 (사용자 환경 존중)
//
// 변경 시 즉시 <html>의 data-theme이 갱신되어 tokens.css의 변수가 스위치된다.

const STORAGE_KEY = 'food-safety:theme';
const LIGHT = 'light';
const DARK  = 'dark';

// 첫 렌더 시 깜빡임 방지를 위해 useState 초기값에서 즉시 계산 + 적용.
function getInitialTheme() {
  // SSR 안전 처리 (Vite SPA에서는 사실상 항상 window 존재)
  if (typeof window === 'undefined') return LIGHT;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === LIGHT || stored === DARK) return stored;

  // OS 설정 반영 — matchMedia가 없는 구형 브라우저는 light로 폴백
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return DARK;
  return LIGHT;
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  // theme 변경 시 <html data-theme> 갱신 + localStorage 영속화
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { window.localStorage.setItem(STORAGE_KEY, theme); }
    catch { /* 시크릿 모드 등에서 localStorage 거부될 수 있음 — 무시 */ }
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === DARK ? LIGHT : DARK));

  return { theme, isDark: theme === DARK, toggle };
}
