import { Droplets, History } from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, Loading } from "../components/Feedback.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate } from "../utils.js";

export default function CareHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/logs");
      setLogs(response.data.logs);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);
  return (
    <>
      <PageHeader eyebrow="EVERY DROP COUNTS" title="Care history" description="A little timeline of all the love you’ve given your plants." />
      {loading ? <Loading label="Gathering your care history..." /> : error ? <ErrorState message={error} onRetry={load} /> : logs.length === 0 ? <EmptyState title="Your care history is waiting" description="The next time you water a plant, we’ll save a little note right here." action={<span className="history-empty-icon"><History size={22} /></span>} /> : (
        <section className="content-panel history-panel">
          <div className="history-summary"><span className="history-summary-icon"><Droplets size={18} /></span><div><strong>{logs.length} {logs.length === 1 ? "watering moment" : "watering moments"}</strong><span>Every time you show your plants a little care.</span></div></div>
          <div className="history-table-wrap"><table className="history-table"><thead><tr><th>PLANT</th><th>ACTION</th><th>DATE</th></tr></thead><tbody>{logs.map((log) => <tr key={log._id}><td><span className="history-plant-icon">🌿</span><strong>{log.plantName}</strong></td><td><span className="action-pill"><Droplets size={14} />{log.action}</span></td><td>{formatDate(log.date)}</td></tr>)}</tbody></table></div>
        </section>
      )}
    </>
  );
}
