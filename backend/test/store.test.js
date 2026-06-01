const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { pickRecentProductNames } = require('../src/services/store');

// pickRecentProductNames만 테스트 — 순수 함수.
// 인스턴스 메서드(getRecentProductNames)는 위 함수의 단순 wrapper라 별도 테스트 불필요.

describe('pickRecentProductNames', () => {
  test('CRET_DTM 내림차순으로 상위 N개 선택', () => {
    const rows = [
      { PRDTNM: '낙지젓',     CRET_DTM: '2026-05-29 13:08:51' },
      { PRDTNM: '신안새우젓', CRET_DTM: '2026-05-29 13:08:27' },
      { PRDTNM: '멍게젓',     CRET_DTM: '2026-05-27 10:00:00' },
      { PRDTNM: '꼴뚜기젓',   CRET_DTM: '2026-05-26 09:00:00' },
    ];
    assert.deepEqual(pickRecentProductNames(rows, 3),
                     ['낙지젓', '신안새우젓', '멍게젓']);
  });

  test('같은 제품명 중복 제거 — 최신 등록일자 유지', () => {
    const rows = [
      { PRDTNM: '낙지젓', CRET_DTM: '2026-05-29' },
      { PRDTNM: '낙지젓', CRET_DTM: '2026-05-28' },  // 중복 → 제외
      { PRDTNM: '새우젓', CRET_DTM: '2026-05-27' },
    ];
    assert.deepEqual(pickRecentProductNames(rows, 5), ['낙지젓', '새우젓']);
  });

  test('빈 제품명은 무시', () => {
    const rows = [
      { PRDTNM: '',     CRET_DTM: '2026-05-29' },
      { PRDTNM: '제품A', CRET_DTM: '2026-05-28' },
      { PRDTNM: null,   CRET_DTM: '2026-05-27' },
    ];
    assert.deepEqual(pickRecentProductNames(rows, 5), ['제품A']);
  });

  test('빈 입력 배열', () => {
    assert.deepEqual(pickRecentProductNames([], 3), []);
  });

  test('limit이 데이터 수보다 클 때 — 가용한 만큼만 반환', () => {
    const rows = [
      { PRDTNM: 'A', CRET_DTM: '2026-01-01' },
      { PRDTNM: 'B', CRET_DTM: '2026-01-02' },
    ];
    assert.deepEqual(pickRecentProductNames(rows, 10), ['B', 'A']);
  });

  test('원본 배열 변경 X (immutable)', () => {
    const rows = [
      { PRDTNM: 'A', CRET_DTM: '2026-01-01' },
      { PRDTNM: 'B', CRET_DTM: '2026-01-02' },
    ];
    const before = rows.map(r => r.PRDTNM);
    pickRecentProductNames(rows, 2);
    const after = rows.map(r => r.PRDTNM);
    assert.deepEqual(after, before);
  });
});
