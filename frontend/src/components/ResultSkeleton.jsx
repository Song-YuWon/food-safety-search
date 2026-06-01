// 결과 영역 스켈레톤 — 검색 직후 700ms 동안 표시.
// 디자인: status banner 자리 + 헤더 + 카드 3장.

function SkelBox({ width = '100%', height = 16, radius = 6 }) {
  return (
    <div className="skel"
         style={{ width, height, borderRadius: radius, flexShrink: 0 }} />
  );
}

export default function ResultSkeleton() {
  return (
    <div style={{ padding: '14px 16px 24px' }}>
      {/* status banner 자리 */}
      <div className="skel" style={{ height: 124, borderRadius: 16 }} />

      {/* list header 자리 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 4px 10px',
      }}>
        <SkelBox width={150} height={11} />
        <SkelBox width={42} height={11} />
      </div>

      {/* card 자리 ×3 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[0, 1, 2].map(i => (
          <article key={i} className="result-card">
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 12,
            }}>
              <SkelBox width={78} height={20} />
              <SkelBox width={68} height={11} />
            </div>
            <SkelBox width={'72%'} height={16} radius={5} />
            <div style={{ height: 8 }} />
            <SkelBox width={'56%'} height={14} radius={5} />
            <div style={{ height: 10 }} />
            <SkelBox width={'38%'} height={12} radius={5} />
          </article>
        ))}
      </div>
    </div>
  );
}
