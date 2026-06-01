import { QuestionMarkGlyph } from './icons';
import { GRADE_SHEET } from '../constants/messages';

// ? 아이콘 버튼 — 위험도 등급 안내 시트를 연다.
// variant:
//   'on-color' — 컬러 배너 위(흰글씨 + 반투명 흰 배경)
//   'subtle'   — 텍스트 행 옆(회색 보더)
export default function GradeInfoButton({ onClick, variant = 'subtle', size = 22 }) {
  // stopPropagation — 카드 안에 박힌 경우 카드 탭 이벤트가 트리거되지 않게
  const handleClick = (e) => { e.stopPropagation(); onClick(); };

  const cls = `grade-info-btn grade-info-btn--${variant}`;
  return (
    <button onClick={handleClick}
            aria-label={GRADE_SHEET.OPEN_LABEL}
            className={cls}
            style={{ width: size, height: size }}>
      <QuestionMarkGlyph size={Math.round(size * 0.55)} />
    </button>
  );
}
