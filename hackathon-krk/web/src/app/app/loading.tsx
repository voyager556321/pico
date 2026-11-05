export default function Loading() {
  return (
    <div className="proto-stack" aria-busy="true" aria-label="Loading page">
      <div className="tq-skeleton" style={{ height: 44, width: "38%" }} />
      <div className="tq-skeleton" style={{ height: 220 }} />
      <div className="tq-skeleton" style={{ height: 320 }} />
    </div>
  );
}
