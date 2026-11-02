import { CalendarDays, Droplets, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils.js";
import StatusBadge from "./StatusBadge.jsx";

const accents = ["plant-art-green", "plant-art-peach", "plant-art-lilac", "plant-art-sage"];

export default function PlantCard({ plant, index = 0, onWater, onDelete, busy }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <article className="plant-card">
      <div className={`plant-art ${accents[index % accents.length]}`}>
        <span className="plant-art-emoji" aria-hidden="true">{index % 4 === 1 ? "🪴" : index % 4 === 2 ? "🌵" : "🌿"}</span>
        <button className="more-button" aria-label={`Options for ${plant.name}`} onClick={() => setMenuOpen(!menuOpen)}>
          <MoreHorizontal size={20} />
        </button>
        {menuOpen && (
          <div className="card-menu">
            <Link to={`/plants/${plant._id}/edit`} onClick={() => setMenuOpen(false)}><Pencil size={15} /> Edit plant</Link>
            <button onClick={() => { setMenuOpen(false); onDelete(plant); }}><Trash2 size={15} /> Delete plant</button>
          </div>
        )}
      </div>
      <div className="plant-card-body">
        <div className="plant-title-row">
          <div><h3>{plant.name}</h3><span className="plant-type">{plant.type}</span></div>
          <StatusBadge status={plant.status} />
        </div>
        <div className="plant-facts">
          <div><span className="fact-icon"><CalendarDays size={15} /></span><span>Last watered<strong>{formatDate(plant.lastWatered)}</strong></span></div>
          <div><span className="fact-icon"><Droplets size={15} /></span><span>Water every<strong>{plant.wateringInterval} {plant.wateringInterval === 1 ? "day" : "days"}</strong></span></div>
        </div>
        <div className={`next-watering ${plant.status === "Overdue" ? "next-overdue" : ""}`}>
          <span>Next watering</span><strong>{formatDate(plant.nextWatering)}</strong>
        </div>
        <button className="button button-water" onClick={() => onWater(plant._id)} disabled={busy}>
          <Droplets size={16} />{busy ? "Saving..." : "Mark as watered"}
        </button>
      </div>
    </article>
  );
}
