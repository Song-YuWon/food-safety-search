// 상세 화면의 섹션 묶음 — 헤더(라벨) + MetaRow들 컨테이너
export default function MetaSection({ title, children }) {
  return (
    <section className="meta-section">
      <header className="meta-section__header">{title}</header>
      <div>{children}</div>
    </section>
  );
}
