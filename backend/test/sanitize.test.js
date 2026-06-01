const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { cleanField, parseImageUrl, sanitizeRow } = require('../src/utils/sanitize');

describe('cleanField', () => {
  test('null/undefined → 빈 문자열', () => {
    assert.equal(cleanField(null), '');
    assert.equal(cleanField(undefined), '');
  });

  test('"데이터없음" → 빈 문자열 (기획서 4-2)', () => {
    assert.equal(cleanField('데이터없음'), '');
  });

  test('"-" 단독 → 빈 문자열 (TELNO 등에서 정보 없음 의미로 사용)', () => {
    assert.equal(cleanField('-'), '');
    assert.equal(cleanField('  -  '), '');
  });

  test('전각 하이픈 "－" (U+FF0D) — 일반 하이픈과 다른 문자', () => {
    assert.equal(cleanField('－'), '');
  });

  test('"없음" / "표시 없음" — DISTBTMLMT에서 발견된 패턴', () => {
    assert.equal(cleanField('없음'), '');
    assert.equal(cleanField('표시 없음'), '');
  });

  test('"미표시" / "무표시" / "*표시제품" — BRCDNO에서 발견', () => {
    assert.equal(cleanField('미표시'), '');
    assert.equal(cleanField('무표시'), '');
    assert.equal(cleanField('미표시제품'), '');
    assert.equal(cleanField('무표시제품'), '');
  });

  test('"-" 포함된 정상 값은 유지 (예: 전화번호 "02-966-2477")', () => {
    assert.equal(cleanField('02-966-2477'), '02-966-2477');
    assert.equal(cleanField('hello-world'), 'hello-world');
  });

  test('placeholder를 포함한 정상 문장은 유지 (예: 제품명)', () => {
    // "무표시"가 단독일 때만 빈 값, 부분 문자열은 정상 데이터로 취급
    assert.equal(cleanField('무표시 제품 시리즈'), '무표시 제품 시리즈');
  });

  test('XML 빈 태그로 인한 true/false → 빈 문자열', () => {
    assert.equal(cleanField(true), '');
    assert.equal(cleanField(false), '');
  });

  test('정상 값 trim', () => {
    assert.equal(cleanField('  hello  '), 'hello');
    assert.equal(cleanField('한국어'), '한국어');
  });
});

describe('parseImageUrl', () => {
  test('콤마 구분 첫 번째 URL만 (기획서 4-2)', () => {
    assert.equal(
      parseImageUrl('http://a.com/1.jpg,http://b.com/2.jpg'),
      'http://a.com/1.jpg'
    );
  });

  test('단일 URL은 그대로', () => {
    assert.equal(parseImageUrl('http://a.com/1.jpg'), 'http://a.com/1.jpg');
  });

  test('빈/null 값', () => {
    assert.equal(parseImageUrl(''), '');
    assert.equal(parseImageUrl(null), '');
  });
});

describe('sanitizeRow', () => {
  test('전체 필드 통합 정제', () => {
    const row = sanitizeRow({
      PRDTNM: '테스트',
      BRCDNO: true,                 // XML 빈 태그 케이스
      IMG_FILE_PATH: 'http://a.com/1.jpg,http://b.com/2.jpg',
      RTRVL_GRDCD_NM: '데이터없음',
      BSSHNM: '  (주)테스트  ',
    });
    assert.equal(row.PRDTNM, '테스트');
    assert.equal(row.BRCDNO, '');
    assert.equal(row.IMG_FILE_PATH, 'http://a.com/1.jpg');
    assert.equal(row.RTRVL_GRDCD_NM, '');
    assert.equal(row.BSSHNM, '(주)테스트');
  });

  test('null/undefined 행 → 빈 객체', () => {
    assert.deepEqual(sanitizeRow(null), {});
    assert.deepEqual(sanitizeRow(undefined), {});
  });
});
