import { LoaderCircle } from "lucide-react";

export function Loading({ label = "Loading your plants..." }) {
  return <div className="loading-state"><LoaderCircle className="spin" size={25} /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }) {
  return <div className="empty-state error-state"><span className="empty-emoji">🍂</span><h3>We couldn’t load this right now</h3><p>{message}</p>{onRetry && <button className="button button-secondary" onClick={onRetry}>Try again</button>}</div>;
}

export function EmptyState({ title, description, action }) {
  return <div className="empty-state"><span className="empty-emoji">🌱</span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
