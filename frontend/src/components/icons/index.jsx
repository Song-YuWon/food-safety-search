// 인라인 SVG 아이콘 모음 — 디자인 핸드오프 screens.jsx의 아이콘들을 모두 옮겨옴.
// 외부 아이콘 라이브러리 미사용 (의존성 최소화).
// 각 아이콘은 크기/색상을 props로 받아 재사용.

export function SearchIcon({ size = 20, stroke = 'currentColor', sw = 1.7 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke={stroke} strokeWidth={sw} />
      <path d="M16 16L20.5 20.5" stroke={stroke}
            strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function AlertTriIcon({ size = 20, color = '#fff', sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3.5 L21.4 20.5 L2.6 20.5 Z"
            stroke={color} strokeWidth={sw} strokeLinejoin="round" fill="none"/>
      <path d="M12 10 V14.2" stroke={color}
            strokeWidth={sw + 0.4} strokeLinecap="round"/>
      <circle cx="12" cy="17.3" r="1.15" fill={color}/>
    </svg>
  );
}

export function CheckCircleIcon({ size = 22, color = '#fff', sw = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={sw} fill="none"/>
      <path d="M7.4 12.5 L10.6 15.6 L16.7 9"
            stroke={color} strokeWidth={sw + 0.2}
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function InfoIcon({ size = 14, color = 'currentColor', sw = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth={sw} fill="none"/>
      <path d="M12 11 V17" stroke={color}
            strokeWidth={sw + 0.4} strokeLinecap="round"/>
      <circle cx="12" cy="7.5" r="1.2" fill={color}/>
    </svg>
  );
}

// ? 마크 (등급 안내 버튼 안쪽)
export function QuestionMarkGlyph({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M5.5 5.5 a2.5 2.5 0 1 1 3.4 2.33 c-.55.22-.9.74-.9 1.34 v.33"
            stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="8" cy="12.2" r="0.95" fill="currentColor"/>
    </svg>
  );
}

// 닫기 X — 클리어 버튼, 시트 헤더 등에서 재사용
export function CloseIcon({ size = 10, color = 'currentColor', sw = 1.8 }) {
  const s = size;
  const p = s * 0.2;       // padding ratio
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <path d={`M${p} ${p} L${s - p} ${s - p} M${s - p} ${p} L${p} ${s - p}`}
            stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </svg>
  );
}

// ← 뒤로 (상세 화면 상단)
export function BackChevron({ size = 22, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M14.5 5 L7.5 12 L14.5 19" stroke={color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            fill="none"/>
    </svg>
  );
}

// 사진 placeholder 아이콘
export function PhotoIcon({ size = 32, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2"
            stroke={color} strokeWidth="1.5" fill="none"/>
      <circle cx="8.5" cy="10" r="1.3" fill={color}/>
      <path d="M3.6 17.6 L9.5 12.2 L13.5 15.5 L20.4 9.5"
            stroke={color} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// 라이브 도트 (홈 "마지막 업데이트" 옆 펄스) — CSS 의존 (.live-dot)
export function LiveDot() {
  return <span className="live-dot" aria-hidden="true" />;
}

// 해 — 라이트 모드 표시용
export function SunIcon({ size = 16, color = 'currentColor', sw = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={sw} fill="none"/>
      {/* 8방향 광선 */}
      {[
        [12, 2, 12, 5], [12, 19, 12, 22],
        [2, 12, 5, 12], [19, 12, 22, 12],
        [4.9, 4.9, 7.0, 7.0], [17, 17, 19.1, 19.1],
        [4.9, 19.1, 7.0, 17], [17, 7.0, 19.1, 4.9],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      ))}
    </svg>
  );
}

// 시계 — 최근 검색 표시용
export function ClockIcon({ size = 12, color = 'currentColor', sw = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={sw} fill="none"/>
      <path d="M12 7 V12 L15 14" stroke={color}
            strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// 달 — 다크 모드 표시용
export function MoonIcon({ size = 16, color = 'currentColor', sw = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20 14.5 A8 8 0 1 1 9.5 4 A6.5 6.5 0 0 0 20 14.5 Z"
            stroke={color} strokeWidth={sw}
            strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
