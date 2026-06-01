const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

const {
  KIND, normalize, tokenize, matchRow,
  decideKind, sortResults, countDanger,
} = require('../src/routes/search.logic');

// 식약처 원본 필드명 — 테스트 데이터 생성용
const F = {
  PRDTNM: 'PRDTNM', BSSHNM: 'BSSHNM', BRCDNO: 'BRCDNO',
  CRET_DTM: 'CRET_DTM', GRADE: 'RTRVL_GRDCD_NM',
};

describe('normalize', () => {
  test('공백 제거 + 소문자', () => {
    assert.equal(normalize('코카 콜라'), '코카콜라');
    assert.equal(normalize('  ABC  Def  '), 'abcdef');
  });
  test('null / undefined 안전 처리', () => {
    assert.equal(normalize(null), '');
    assert.equal(normalize(undefined), '');
  });
});

describe('tokenize', () => {
  test('공백으로 분리', () => {
    assert.deepEqual(tokenize('강황가루 진성'), ['강황가루', '진성']);
  });
  test('다중 공백 + 양끝 공백 모두 정리', () => {
    assert.deepEqual(tokenize('  강황가루   진성  '), ['강황가루', '진성']);
  });
  test('빈 문자열', () => {
    assert.deepEqual(tokenize(''), []);
    assert.deepEqual(tokenize('   '), []);
  });
});

describe('matchRow', () => {
  test('단일 토큰 — 제품명 부분 일치', () => {
    const row = { [F.PRDTNM]: '강황가루', [F.BSSHNM]: '(주)진성' };
    assert.ok(matchRow(row, ['강황가루']));
    assert.ok(matchRow(row, ['황가']));      // 부분 일치
    assert.ok(!matchRow(row, ['없는']));
  });

  test('멀티 토큰 — 다른 필드에 분산되어 있어도 AND 매칭', () => {
    // "강황가루 진성" 검색: 제품명에 강황가루, 제조사에 진성이 있으면 매칭
    const row = { [F.PRDTNM]: '강황가루 1kg', [F.BSSHNM]: '(주)진성바이오' };
    assert.ok(matchRow(row, ['강황가루', '진성']));
  });

  test('멀티 토큰 — 토큰 하나라도 없으면 미매칭 (AND)', () => {
    const row = { [F.PRDTNM]: '강황가루', [F.BSSHNM]: '(주)진성' };
    assert.ok(!matchRow(row, ['강황가루', '없는단어']));
  });

  test('공백 무시 — "코카 콜라" ↔ "코카콜라"', () => {
    const row = { [F.PRDTNM]: '코카콜라', [F.BSSHNM]: '' };
    // 사용자가 "코카콜라"를 한 단어로 입력했다면 토큰 1개
    assert.ok(matchRow(row, tokenize('코카콜라')));
    // "코카 콜라"를 입력했어도 두 토큰 모두 "코카콜라" 안에서 부분 일치
    assert.ok(matchRow(row, tokenize('코카 콜라')));
  });

  test('바코드 검색', () => {
    const row = { [F.PRDTNM]: '', [F.BSSHNM]: '', [F.BRCDNO]: '8801234567890' };
    assert.ok(matchRow(row, ['8801234']));
  });

  test('대소문자 무시 — tokenize를 거치면 정상 매칭', () => {
    // matchRow는 정규화된 tokens를 받는 게 계약. 실제 흐름은 tokenize → matchRow.
    const row = { [F.PRDTNM]: 'CoCa Cola' };
    assert.ok(matchRow(row, tokenize('coca')));
    assert.ok(matchRow(row, tokenize('COLA')));
  });
});

describe('decideKind', () => {
  test('결과 0건 → safe', () => {
    assert.equal(decideKind([]), KIND.SAFE);
  });
  test('1등급 포함 → danger', () => {
    assert.equal(decideKind([{ [F.GRADE]: '1등급' }]), KIND.DANGER);
  });
  test('2등급 포함 → danger', () => {
    assert.equal(decideKind([{ [F.GRADE]: '2등급' }]), KIND.DANGER);
  });
  test('3등급만 → caution', () => {
    assert.equal(decideKind([
      { [F.GRADE]: '3등급' }, { [F.GRADE]: '3등급' },
    ]), KIND.CAUTION);
  });
  test('1·3 혼합 → danger (가장 높은 위험도 우선)', () => {
    assert.equal(decideKind([
      { [F.GRADE]: '3등급' }, { [F.GRADE]: '1등급' },
    ]), KIND.DANGER);
  });
});

describe('sortResults', () => {
  test('등록일 내림차순 — 최근 것이 먼저', () => {
    const rows = [
      { [F.CRET_DTM]: '20260101', [F.GRADE]: '3등급' },
      { [F.CRET_DTM]: '20260520', [F.GRADE]: '3등급' },
      { [F.CRET_DTM]: '20260301', [F.GRADE]: '3등급' },
    ];
    const sorted = sortResults(rows);
    assert.equal(sorted[0][F.CRET_DTM], '20260520');
    assert.equal(sorted[1][F.CRET_DTM], '20260301');
    assert.equal(sorted[2][F.CRET_DTM], '20260101');
  });

  test('같은 날짜 — 위험도 높은 것이 먼저', () => {
    const rows = [
      { [F.CRET_DTM]: '20260520', [F.GRADE]: '3등급' },
      { [F.CRET_DTM]: '20260520', [F.GRADE]: '1등급' },
      { [F.CRET_DTM]: '20260520', [F.GRADE]: '2등급' },
    ];
    const sorted = sortResults(rows);
    assert.equal(sorted[0][F.GRADE], '1등급');
    assert.equal(sorted[1][F.GRADE], '2등급');
    assert.equal(sorted[2][F.GRADE], '3등급');
  });

  test('원본 배열을 변경하지 않음 (immutable)', () => {
    const rows = [
      { [F.CRET_DTM]: '20260101' },
      { [F.CRET_DTM]: '20260520' },
    ];
    const before = rows.map(r => r[F.CRET_DTM]);
    sortResults(rows);
    const after = rows.map(r => r[F.CRET_DTM]);
    assert.deepEqual(after, before);
  });
});

describe('countDanger', () => {
  test('1·2등급만 카운트', () => {
    assert.equal(countDanger([
      { [F.GRADE]: '1등급' },
      { [F.GRADE]: '2등급' },
      { [F.GRADE]: '3등급' },
      { [F.GRADE]: '' },
    ]), 2);
  });
  test('빈 배열', () => {
    assert.equal(countDanger([]), 0);
  });
});
