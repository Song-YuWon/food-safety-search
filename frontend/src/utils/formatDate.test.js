import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatYmdHm, formatResultStamp, formatCretDtm } from './formatDate';

describe('formatYmdHm', () => {
  it('ISO 시각 → "YYYY-MM-DD HH:mm"', () => {
    // UTC 기준 — Date 생성자가 로컬 시각으로 변환하므로 로컬 시간으로 검증
    const iso = '2026-05-30T14:18:18.911Z';
    const d = new Date(iso);
    const expected =
      `${d.getFullYear()}-` +
      `${String(d.getMonth() + 1).padStart(2, '0')}-` +
      `${String(d.getDate()).padStart(2, '0')} ` +
      `${String(d.getHours()).padStart(2, '0')}:` +
      `${String(d.getMinutes()).padStart(2, '0')}`;
    expect(formatYmdHm(iso)).toBe(expected);
  });

  it('null / 빈 문자열 → 빈 문자열', () => {
    expect(formatYmdHm(null)).toBe('');
    expect(formatYmdHm('')).toBe('');
    expect(formatYmdHm(undefined)).toBe('');
  });

  it('파싱 실패 (잘못된 ISO) → 빈 문자열', () => {
    expect(formatYmdHm('not-a-date')).toBe('');
  });

  it('한 자리 월/일/시/분 zero-padding', () => {
    // 1월 5일 09시 03분
    const d = new Date(2026, 0, 5, 9, 3);
    expect(formatYmdHm(d.toISOString())).toBe('2026-01-05 09:03');
  });
});

describe('formatResultStamp', () => {
  beforeEach(() => {
    // Date를 고정 — "오늘" 판정이 결정적이게
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 30, 15, 0)); // 2026-05-30 15:00 로컬
  });
  afterEach(() => vi.useRealTimers());

  it('같은 날 → "오늘 HH:mm 기준"', () => {
    const today = new Date(2026, 4, 30, 4, 0).toISOString();
    expect(formatResultStamp(today)).toBe('오늘 04:00 기준');
  });

  it('다른 날 → "YYYY-MM-DD HH:mm 기준"', () => {
    const otherDay = new Date(2026, 4, 28, 14, 30).toISOString();
    expect(formatResultStamp(otherDay)).toBe('2026-05-28 14:30 기준');
  });

  it('빈 입력', () => {
    expect(formatResultStamp(null)).toBe('');
    expect(formatResultStamp('')).toBe('');
  });
});

describe('formatCretDtm', () => {
  it('YYYYMMDD → "YYYY.MM.DD"', () => {
    expect(formatCretDtm('20260521')).toBe('2026.05.21');
  });

  it('YYYYMMDDHHmm → 앞 8자만 사용', () => {
    expect(formatCretDtm('202605211430')).toBe('2026.05.21');
  });

  it('Postgres timestamp ("YYYY-MM-DD HH:mm:ss.fractional") — 실제 응답 형식', () => {
    expect(formatCretDtm('2026-05-29 13:08:51.806904')).toBe('2026.05.29');
  });

  it('ISO 8601 ("YYYY-MM-DDTHH:mm:ss")', () => {
    expect(formatCretDtm('2026-05-29T13:08:51Z')).toBe('2026.05.29');
  });

  it('YYYY-MM-DD 짧은 형식', () => {
    expect(formatCretDtm('2026-05-29')).toBe('2026.05.29');
  });

  it('8자 미만은 그대로 (방어)', () => {
    expect(formatCretDtm('2026')).toBe('2026');
  });

  it('빈 입력', () => {
    expect(formatCretDtm('')).toBe('');
    expect(formatCretDtm(null)).toBe('');
  });
});
