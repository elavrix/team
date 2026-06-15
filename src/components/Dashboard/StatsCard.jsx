export default function StatsCard({ label, value, tone, detail }) {
  return (
    <article className={`stats-card ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}
