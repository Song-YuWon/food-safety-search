import { DISCLAIMER } from '../constants/messages';

// 결과/상세 화면 공통 푸터 — 면책 라인 + 데이터 출처.
// 기획서·README가 "중복 노출"을 명시한 핵심 패턴.
export default function ResultFooter() {
  return (
    <footer style={{
      marginTop: 18, paddingTop: 14,
      borderTop: '1px solid var(--hairline)',
      textAlign: 'center',
      paddingBottom: 16,
    }}>
      <p style={{
        margin: 0,
        fontSize: 11.5, lineHeight: 1.55,
        color: 'var(--disclaimer)',
        letterSpacing: '-0.005em',
        fontWeight: 500,
      }}>
        {DISCLAIMER.SHORT}
      </p>
      <p style={{
        margin: '6px 0 0',
        fontSize: 10,
        color: 'var(--text-4)',
        letterSpacing: '0.04em',
      }}>
        {DISCLAIMER.DATA_SOURCE}
      </p>
    </footer>
  );
}
