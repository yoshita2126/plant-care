import { ArrowLeft, Leaf, Save } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../services/api.js";
import { toDateInput } from "../utils.js";

export default function PlantForm({ plant, onSaved }) {
  const [form, setForm] = useState({
    name: plant?.name || "",
    type: plant?.type || "",
    wateringInterval: plant?.wateringInterval ?? 7,
    lastWatered: toDateInput(plant?.lastWatered) || new Date().toISOString().slice(0, 10),
    notes: plant?.notes || ""
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, wateringInterval: Number(form.wateringInterval) };
      if (plant) await api.put(`/plants/${plant._id}`, payload);
      else await api.post("/plants", payload);
      onSaved();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-page">
      <Link to="/plants" className="back-link"><ArrowLeft size={16} /> Back to my plants</Link>
      <div className="form-panel">
        <div className="form-intro-icon"><Leaf size={23} /></div>
        <div className="eyebrow">{plant ? "UPDATE YOUR COLLECTION" : "GROW YOUR COLLECTION"}</div>
        <h2>{plant ? "Edit plant details" : "Add a new plant"}</h2>
        <p>Every plant has its own rhythm. Add a few details so we can help you keep track.</p>
        {error && <div className="alert error-alert" role="alert">{error}</div>}
        <form onSubmit={submit} className="plant-form">
          <label>Plant name <span>*</span>
            <input name="name" value={form.name} onChange={update} required maxLength="80" placeholder="e.g. Monstera" />
          </label>
          <label>Plant type <span>*</span>
            <input name="type" value={form.type} onChange={update} required maxLength="80" placeholder="e.g. Tropical, succulent" />
          </label>
          <div className="form-two-col">
            <label>Watering interval <span>*</span>
              <div className="input-suffix"><input name="wateringInterval" type="number" value={form.wateringInterval} onChange={update} min="1" max="3650" required /><span>days</span></div>
            </label>
            <label>Last watered <span>*</span>
              <input name="lastWatered" type="date" value={form.lastWatered} onChange={update} required />
            </label>
          </div>
          <label>Notes <small>(optional)</small>
            <textarea name="notes" value={form.notes} onChange={update} maxLength="1000" rows="4" placeholder="Anything special to remember about this plant?" />
          </label>
          <div className="form-actions">
            <Link to="/plants" className="button button-secondary">Cancel</Link>
            <button type="submit" className="button button-primary" disabled={saving}><Save size={16} />{saving ? "Saving..." : plant ? "Save changes" : "Add plant"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
