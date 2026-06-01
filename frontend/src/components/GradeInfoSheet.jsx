import { useEffect } from 'react';
import GradeBadge from './GradeBadge';
import { CloseIcon } from './icons';
import { GRADE_SHEET } from '../constants/messages';
import { GRADE_INFO } from '../constants/grades';
import './GradeInfoSheet.css';

// 하단 시트 — 위험도 등급 안내. ESC / X / backdrop 어디든 닫힘.
// CSS 트랜지션 길이가 길어 mount/unmount 대신 open prop으로 토글.
export default function GradeInfoSheet({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`gi-backdrop ${open ? 'open' : ''}`}
           onClick={onClose}
           aria-hidden={!open} />

      <div className={`gi-sheet ${open ? 'open' : ''}`}
           role="dialog" aria-modal="true"
           aria-label={GRADE_SHEET.TITLE}
           aria-hidden={!open}>
        <div className="gi-handle-wrap"><div className="gi-handle" /></div>

        <header className="gi-header">
          <h2 className="gi-title">{GRADE_SHEET.TITLE}</h2>
          <button onClick={onClose} aria-label={GRADE_SHEET.CLOSE_LABEL}
                  className="gi-close">
            <CloseIcon size={16} sw={1.8} />
          </button>
        </header>

        <div className="gi-body">
          {GRADE_INFO.map((g, i) => (
            <section key={g.grade}
                     className={`gi-section ${i < GRADE_INFO.length - 1 ? 'gi-section--divider' : ''}`}>
              <div className="gi-section__badge">
                <GradeBadge grade={g.grade} />
              </div>
              <p className="gi-section__desc">{g.desc}</p>
              <div className={`gi-example gi-example--g${g.grade}`}>
                <div className="gi-example__label">{GRADE_SHEET.EXAMPLE_LABEL}</div>
                <p className="gi-example__body">{g.examples}</p>
              </div>
            </section>
          ))}

          <p className="gi-footnote">
            {GRADE_SHEET.FOOTNOTE_PREFIX}
            <strong>{GRADE_SHEET.FOOTNOTE_EMPHASIS}</strong>
            {GRADE_SHEET.FOOTNOTE_SUFFIX}
          </p>
        </div>
      </div>
    </>
  );
}
