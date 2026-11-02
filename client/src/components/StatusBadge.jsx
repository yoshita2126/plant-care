export default function StatusBadge({ status }) {
  const kind = status === "Overdue" ? "overdue" : status === "Due Today" ? "due" : "upcoming";
  return <span className={`status-badge ${kind}`}><span className="status-dot" />{status}</span>;
}
