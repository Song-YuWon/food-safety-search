import { useEffect, useState } from 'react';
import { API } from '../constants/config';

// 홈 화면의 "마지막 업데이트" 표시를 위한 상태 조회.
// 한 번만 호출 — 사용자가 한참 머무를 경우 stale해질 수 있지만,
// 실제 동기화는 매일 04:00에만 발생하므로 정합성 문제 거의 없음.
export default function useStatus() {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [count, setCount] = useState(null);
  const [recent, setRecent] = useState([]);   // 최근 회수 제품 N개 — 추천 칩에 사용

  useEffect(() => {
    fetch(API.STATUS)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!json) return;
        setLastUpdated(json.lastUpdated);
        setCount(json.count);
        setRecent(Array.isArray(json.recent) ? json.recent : []);
      })
      .catch(() => { /* 무시 — 상태 표시 실패는 핵심 기능 차단 안함 */ });
  }, []);

  return { lastUpdated, count, recent };
}
