import { useState } from 'react';
import { PhotoIcon } from './icons';
import { DETAIL, IMAGE_VIEWER } from '../constants/messages';

// 상세 화면 상단 사진 영역.
// 식약처 IMG_FILE_PATH가 있으면 이미지를, 없으면 placeholder를 보여준다.
// onError 시 이미지를 숨기고 placeholder로 폴백 (깨진 이미지 노출 방지).
// onClick이 전달되고 이미지가 정상이면 클릭 가능(확대 가능)으로 표시.
export default function PhotoPlaceholder({ src, onClick }) {
  const [errored, setErrored] = useState(false);
  const showImage = src && !errored;
  const clickable = showImage && typeof onClick === 'function';

  if (showImage) {
    return (
      <img src={src} alt={DETAIL.IMAGE_LABEL}
           onError={() => setErrored(true)}
           onClick={clickable ? onClick : undefined}
           role={clickable ? 'button' : undefined}
           tabIndex={clickable ? 0 : undefined}
           aria-label={clickable ? IMAGE_VIEWER.OPEN_LABEL : undefined}
           onKeyDown={clickable
             ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick()
             : undefined}
           style={{
             width: '100%',
             aspectRatio: '16 / 10',
             borderRadius: 14,
             objectFit: 'cover',
             border: '1px solid var(--hairline)',
             cursor: clickable ? 'zoom-in' : 'default',
           }}/>
    );
  }
  return (
    <div className="photo-placeholder">
      <PhotoIcon size={32} />
      <span className="photo-placeholder__label">{DETAIL.IMAGE_LABEL}</span>
    </div>
  );
}
