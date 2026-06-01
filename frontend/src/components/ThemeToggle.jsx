import { SunIcon, MoonIcon } from './icons';
import { APP } from '../constants/messages';
import './ThemeToggle.css';

// 다크/라이트 토글 버튼.
//   variant: 기본    — phone 컨테이너 우상단에 absolute로 고정 (모든 모드 공통).
//            inline — 상세 화면 navbar 안에 들어가는 작은 버튼 (절대 위치 해제, 보더/그림자 제거).
// 현재 다크 모드면 ☀️ (라이트로 전환 액션 암시), 라이트 모드면 🌙.
export default function ThemeToggle({ isDark, onToggle, inline = false }) {
  const label = isDark ? APP.THEME_TO_LIGHT : APP.THEME_TO_DARK;
  const className = inline ? 'theme-toggle theme-toggle--inline' : 'theme-toggle';
  return (
    <button type="button"
            onClick={onToggle}
            className={className}
            aria-label={label}
            title={label}>
      {isDark
        ? <SunIcon  size={16} color="var(--text-2)" sw={1.8} />
        : <MoonIcon size={16} color="var(--text-2)" sw={1.8} />}
    </button>
  );
}
