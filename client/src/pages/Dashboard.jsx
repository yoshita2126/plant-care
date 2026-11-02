import { ArrowRight, Droplets, Flower2, Leaf, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, Loading } from "../components/Feedback.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import api, { getErrorMessage } from "../services/api.js";
import { formatDate, greeting } from "../utils.js";

export default function Dashboard() {
  const [plants, setPlants] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [wateringId, setWateringId] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [plantResponse, logResponse] = await Promise.all([api.get("/plants"), api.get("/logs")]);
      setPlants(plantResponse.data.plants);
      setLogs(logResponse.data.logs);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const dueToday = plants.filter((plant) => plant.status === "Due Today");
  const overdue = plants.filter((plant) => plant.status === "Overdue").sort((a, b) => b.daysOverdue - a.daysOverdue);
  const allUpcoming = plants.filter((plant) => plant.status === "Upcoming").sort((a, b) => new Date(a.nextWatering) - new Date(b.nextWatering));
  const upcoming = allUpcoming.slice(0, 4);

  async function waterPlant(id) {
    setWateringId(id);
    setNotice("");
    try {
      await api.post(`/plants/${id}/water`);
      setNotice("Watering saved — your dashboard is up to date.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setWateringId("");
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <>
      <PageHeader eyebrow={new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase()} title={`${greeting()} 🌿`} description="Here’s a little look at how your leafy friends are doing." action={<Link className="button button-primary" to="/plants/new"><span>＋</span> Add a plant</Link>} />
      <section className="welcome-banner">
        <div><div className="welcome-kicker"><Sparkles size={14} /> YOUR LITTLE GREEN CORNER</div><h2>{plants.length ? "Your plants are growing beautifully." : "A happier home starts with a little green."}</h2><p>{plants.length ? "A few thoughtful moments of care make all the difference." : "Bring your plants in and we’ll help you remember when they need a drink."}</p></div>
        <div className="banner-plant" aria-hidden="true">🪴</div>
        <span className="banner-circle circle-one" /><span className="banner-circle circle-two" />
      </section>
      {notice && <div className="alert success-alert" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

      <section className="stats-grid" aria-label="Plant overview">
        <Stat icon={<Flower2 size={19} />} label="Total plants" value={plants.length} note="in your collection" tone="green" />
        <Stat icon={<Droplets size={19} />} label="Due today" value={dueToday.length} note={dueToday.length ? "ready for a drink" : "nothing to water today"} tone="blue" />
        <Stat icon={<span>⌛</span>} label="Overdue" value={overdue.length} note={overdue.length ? "could use some love" : "all caught up"} tone="peach" />
        <Stat icon={<Leaf size={19} />} label="Watering soon" value={allUpcoming.length} note="coming up next" tone="lavender" />
      </section>

      <div className="dashboard-columns">
        <section className="content-panel attention-panel">
          <div className="section-heading"><div><div className="eyebrow">A GENTLE NUDGE</div><h2>Needs your attention</h2></div><Link to="/plants" className="text-link">View plants <ArrowRight size={15} /></Link></div>
          {[...overdue, ...dueToday].length === 0 ? (
            <div className="quiet-empty"><span>✨</span><div><strong>All your plants are happy</strong><p>No watering needed right now.</p></div></div>
          ) : [...overdue, ...dueToday].slice(0, 5).map((plant) => (
            <div className="attention-row" key={plant._id}><span className="attention-emoji">{plant.status === "Overdue" ? "🪴" : "🌿"}</span><div className="attention-name"><strong>{plant.name}</strong><span>{plant.status === "Overdue" ? `${plant.daysOverdue} ${plant.daysOverdue === 1 ? "day" : "days"} overdue` : "A drink today"}</span></div><StatusBadge status={plant.status} /><button className="small-arrow attention-water" onClick={() => waterPlant(plant._id)} disabled={wateringId === plant._id} aria-label={`Mark ${plant.name} as watered`} title="Mark as watered"><Droplets size={15} /></button><Link to={`/plants/${plant._id}/edit`} className="small-arrow" aria-label={`Edit ${plant.name}`}><ArrowRight size={16} /></Link></div>
          ))}
        </section>
        <section className="content-panel upcoming-panel">
          <div className="section-heading"><div><div className="eyebrow">ON THE HORIZON</div><h2>Coming up</h2></div><Link to="/plants" className="text-link">All plants <ArrowRight size={15} /></Link></div>
          {upcoming.length === 0 ? <div className="quiet-empty"><span>🌱</span><div><strong>Nothing coming up yet</strong><p>Add a plant to see its reminder.</p></div></div> : upcoming.map((plant) => (
            <div className="upcoming-row" key={plant._id}><span className="upcoming-icon"><Droplets size={17} /></span><div><strong>{plant.name}</strong><span>Every {plant.wateringInterval} days</span></div><time>{formatDate(plant.nextWatering)}</time></div>
          ))}
        </section>
      </div>

      <section className="content-panel history-preview">
        <div className="section-heading"><div><div className="eyebrow">LITTLE WINS</div><h2>Recently watered</h2></div><Link to="/history" className="text-link">See history <ArrowRight size={15} /></Link></div>
        {logs.length === 0 ? <EmptyState title="Your care story starts here" description="Once you water a plant, its care history will show up here." action={<Link className="button button-secondary" to="/plants">Meet your plants</Link>} /> : <div className="recent-list">{logs.slice(0, 4).map((log) => <div className="recent-row" key={log._id}><span className="recent-water-icon"><Droplets size={17} /></span><div><strong>{log.plantName}</strong><span>{log.action}</span></div><time>{formatDate(log.date)}</time></div>)}</div>}
      </section>
    </>
  );
}

function Stat({ icon, label, value, note, tone }) {
  return <article className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}
