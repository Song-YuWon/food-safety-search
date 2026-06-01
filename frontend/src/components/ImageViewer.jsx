import { useEffect } from 'react';
import { CloseIcon } from './icons';
import { IMAGE_VIEWER, DETAIL } from '../constants/messages';
import './ImageViewer.css';

// 풀스크린 이미지 뷰어 — 상세 화면의 사진 클릭 시 표시.
// 등급 안내 시트와 동일 패턴: ESC / X 버튼 / 배경 클릭 모두 닫힘.
// CSS 트랜지션 위해 mount는 유지하고 open prop으로 토글.
export default function ImageViewer({ src, isOpen, onClose }) {
  // 열려있을 때만 ESC 핸들러 등록 — 닫혀있을 때 다른 모달의 ESC와 충돌 방지
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // 이미지가 없으면 렌더링 자체 안 함 (state 없는 컴포넌트)
  if (!src) return null;

  return (
    <div className={`image-viewer ${isOpen ? 'open' : ''}`}
         onClick={onClose}
         role="dialog" aria-modal="true"
         aria-label={DETAIL.IMAGE_LABEL}
         aria-hidden={!isOpen}>
      <button type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label={IMAGE_VIEWER.CLOSE_LABEL}
              className="image-viewer__close">
        <CloseIcon size={18} color="#fff" sw={2} />
      </button>
      {/* 이미지 자체 클릭은 배경 클릭으로 전파되지 않게 — 실수로 닫히는 것 방지 */}
      <img src={src}
           alt={DETAIL.IMAGE_LABEL}
           onClick={(e) => e.stopPropagation()}
           className="image-viewer__img"/>
    </div>
  );
}
