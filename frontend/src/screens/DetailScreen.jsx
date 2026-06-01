import { useState } from 'react';
import GradeBadge from '../components/GradeBadge';
import GradeInfoButton from '../components/GradeInfoButton';
import MetaRow from '../components/MetaRow';
import MetaSection from '../components/MetaSection';
import PhotoPlaceholder from '../components/PhotoPlaceholder';
import ResultFooter from '../components/ResultFooter';
import ThemeToggle from '../components/ThemeToggle';
import ImageViewer from '../components/ImageViewer';
import { BackChevron } from '../components/icons';
import { DETAIL, APP, formatGradeLabel } from '../constants/messages';
import { GRADE_NOTE, gradeNumber } from '../constants/grades';
import { FIELD } from '../constants/config';
import { formatCretDtm } from '../utils/formatDate';
import './DetailScreen.css';

// 상세 화면 — 회수 이력 1건의 모든 정보.
// row는 백엔드가 내려준 원본 식약처 필드(PRDTNM, BSSHNM 등) 그대로.
// 상세 화면은 detail-sheet(z:30)가 우상단 토글(z:10)을 가리므로
// 자체 navbar 우측에 별도 인라인 토글을 둔다.
export default function DetailScreen({ row, onBack, onOpenGradeInfo, isDark, toggleTheme }) {
  // 이미지 뷰어는 상세 화면 내부 상태 — 부모(App.jsx)까지 끌어올릴 필요 없음
  const [viewerOpen, setViewerOpen] = useState(false);

  if (!row) return null;

  const grade = gradeNumber(row[FIELD.GRADE]);
  const gradeNote = grade ? GRADE_NOTE[grade] : '';
  const imageUrl = row[FIELD.IMAGE_URL];

  // value 폴백 — 빈 값일 때 "—"로 표시 (기획서 4-2: 빈 태그는 표시 안 함이 원칙이지만
  // 상세 화면은 행 자체가 사라지면 레이아웃이 어색해 보여 "—"로 채움)
  const v = (val) => val || DETAIL.EMPTY_VALUE;

  // 회수 정보 카드 좌측 보더 색상 — 등급에 따라 분기 (GradeBadge와 동일 규칙)
  const cardVariant =
    grade === 1 || grade === 2 ? 'danger'
    : grade === 3              ? 'warning'
    :                            'neutral';

  // 회수 등급 행은 ? 버튼이 inline으로 들어감
  const gradeValue = grade ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {formatGradeLabel(grade)}
      <GradeInfoButton onClick={onOpenGradeInfo} variant="subtle" size={20} />
    </span>
  ) : DETAIL.EMPTY_VALUE;

  return (
    <div className="detail-screen">
      <nav className="detail-nav">
        <button onClick={onBack} aria-label={DETAIL.BACK} className="detail-nav__btn">
          <BackChevron size={22} />
        </button>
        <div className="detail-nav__title">{DETAIL.TITLE}</div>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} inline />
      </nav>

      <div className="detail-body">
        <PhotoPlaceholder src={imageUrl} onClick={() => setViewerOpen(true)} />

        <div className="detail-hero">
          {grade && (
            <div className="detail-hero__badge-row">
              <GradeBadge grade={grade} />
              <span className="detail-hero__note">{gradeNote}</span>
            </div>
          )}
          <h1 className="detail-hero__product">{row[FIELD.PRODUCT_NAME]}</h1>
          <div className="detail-hero__maker">{row[FIELD.MAKER_NAME]}</div>
        </div>

        <section className={`detail-recall-card detail-recall-card--${cardVariant}`}>
          <MetaRow label={DETAIL.L_REASON}   value={v(row[FIELD.RECALL_REASON])} />
          <MetaRow label={DETAIL.L_GRADE}    value={gradeValue} />
          <MetaRow label={DETAIL.L_METHOD}   value={v(row[FIELD.RECALL_METHOD])} />
          <MetaRow label={DETAIL.L_REG_DATE} value={v(formatCretDtm(row[FIELD.CREATED_AT]))} isLast />
        </section>

        <MetaSection title={DETAIL.MAKER_INFO}>
          <MetaRow label={DETAIL.L_MAKER} value={v(row[FIELD.MAKER_NAME])} />
          <MetaRow label={DETAIL.L_ADDR}  value={v(row[FIELD.ADDRESS])} />
          <MetaRow label={DETAIL.L_PHONE}
                   value={<span className="mono">{v(row[FIELD.PHONE])}</span>}
                   isLast />
        </MetaSection>

        <MetaSection title={DETAIL.PRODUCT_INFO}>
          <MetaRow label={DETAIL.L_TYPE} value={v(row[FIELD.CATEGORY_NAME])} />
          <MetaRow label={DETAIL.L_PKG}  value={v(row[FIELD.PACKAGE_UNIT])} />
          <MetaRow label={DETAIL.L_EXP}  value={v(row[FIELD.EXPIRY])} />
          <MetaRow label={DETAIL.L_BARCODE}
                   value={<span className="mono">{v(row[FIELD.BARCODE])}</span>}
                   isLast />
        </MetaSection>

        <ResultFooter />
      </div>

      {/* 풀스크린 이미지 뷰어 — 부모 .detail-sheet 안 absolute로 떠 있음 */}
      <ImageViewer src={imageUrl}
                   isOpen={viewerOpen}
                   onClose={() => setViewerOpen(false)} />
    </div>
  );
}
