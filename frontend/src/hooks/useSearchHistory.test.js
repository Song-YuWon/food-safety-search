import { describe, it, expect } from 'vitest';
import { addToHistory, removeFromHistory, MAX_ITEMS } from './useSearchHistory';

// 순수 함수만 테스트 — React 훅 부분은 단순한 wrapper라 별도 테스트 불필요.
// storage I/O는 try/catch로 감싸져 있어 환경에 따라 실패해도 메모리 상태가 살아남는 게 보장됨.

describe('addToHistory', () => {
  it('빈 배열에 추가', () => {
    expect(addToHistory([], '낙지')).toEqual(['낙지']);
  });

  it('LRU — 같은 검색어 다시 추가하면 맨 앞으로 이동', () => {
    const before = ['국화', '낙지', '강황가루'];
    expect(addToHistory(before, '낙지')).toEqual(['낙지', '국화', '강황가루']);
  });

  it('새 검색어는 항상 맨 앞에', () => {
    expect(addToHistory(['a', 'b'], 'c')).toEqual(['c', 'a', 'b']);
  });

  it(`최대 ${MAX_ITEMS}개 유지 — 초과 시 가장 오래된 것 제거`, () => {
    const five = ['e', 'd', 'c', 'b', 'a'];
    expect(addToHistory(five, 'f')).toEqual(['f', 'e', 'd', 'c', 'b']);
  });

  it('빈 문자열은 무시', () => {
    expect(addToHistory(['a'], '')).toEqual(['a']);
    expect(addToHistory(['a'], '   ')).toEqual(['a']);
  });

  it('null/undefined 무시', () => {
    expect(addToHistory(['a'], null)).toEqual(['a']);
    expect(addToHistory(['a'], undefined)).toEqual(['a']);
  });

  it('양끝 공백 trim', () => {
    expect(addToHistory([], '  낙지  ')).toEqual(['낙지']);
  });

  it('원본 배열 변경 X (immutable)', () => {
    const before = ['a', 'b'];
    const beforeCopy = [...before];
    addToHistory(before, 'c');
    expect(before).toEqual(beforeCopy);
  });

  it('max 옵션 — 커스텀 최대 개수', () => {
    expect(addToHistory(['a', 'b', 'c'], 'd', 2)).toEqual(['d', 'a']);
  });
});

describe('removeFromHistory', () => {
  it('특정 검색어 1개 삭제', () => {
    expect(removeFromHistory(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });

  it('없는 검색어 — 그대로', () => {
    expect(removeFromHistory(['a', 'b'], 'z')).toEqual(['a', 'b']);
  });

  it('빈 배열 — 그대로', () => {
    expect(removeFromHistory([], 'a')).toEqual([]);
  });

  it('원본 배열 변경 X (immutable)', () => {
    const before = ['a', 'b'];
    removeFromHistory(before, 'a');
    expect(before).toEqual(['a', 'b']);
  });
});
