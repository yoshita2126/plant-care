import { Leaf, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import { EmptyState, ErrorState, Loading } from "../components/Feedback.jsx";
import PlantCard from "../components/PlantCard.jsx";
import api, { getErrorMessage } from "../services/api.js";

export default function MyPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/plants");
      setPlants(response.data.plants);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function waterPlant(id) {
    setBusy(id);
    setNotice("");
    try {
      await api.post(`/plants/${id}/water`);
      setNotice("Plant marked as watered. Your reminder has been updated.");
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy("");
    }
  }

  async function deletePlant(plant) {
    if (!window.confirm(`Delete ${plant.name} and its care history? This cannot be undone.`)) return;
    setNotice("");
    setError("");
    try {
      await api.delete(`/plants/${plant._id}`);
      setNotice(`${plant.name} and its care history were deleted.`);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  const filtered = plants.filter((plant) => `${plant.name} ${plant.type}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="YOUR LEAFY FAMILY" title="My plants" description="A little care goes a long way. Here’s everyone in your collection." action={<Link className="button button-primary" to="/plants/new"><Plus size={17} /> Add a plant</Link>} />
      {notice && <div className="alert success-alert" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}
      {loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : plants.length === 0 ? <EmptyState title="Your plant family starts here" description="Add your first plant and we’ll help you keep track of its watering routine." action={<Link className="button button-primary" to="/plants/new"><Plus size={16} /> Add your first plant</Link>} /> : (
        <>
          <div className="plants-toolbar"><span><Leaf size={16} /> {plants.length} {plants.length === 1 ? "plant" : "plants"} growing with you</span><label className="search-field"><Search size={16} /><input placeholder="Find a plant..." value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search plants" /></label></div>
          {filtered.length === 0 ? <EmptyState title="No plants found" description="Try another name or plant type." /> : <div className="plant-grid">{filtered.map((plant, index) => <PlantCard key={plant._id} plant={plant} index={index} onWater={waterPlant} onDelete={deletePlant} busy={busy === plant._id} />)}</div>}
        </>
      )}
    </>
  );
}
