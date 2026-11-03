import mongoose from "mongoose";

const plantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  type: { type: String, required: true, trim: true, maxlength: 80 },
  wateringInterval: { type: Number, required: true, min: 1, max: 3650 },
  lastWatered: { type: Date, required: true },
  notes: { type: String, trim: true, maxlength: 1000 }
}, {
  timestamps: true,
  collection: "plants"
});

export default mongoose.models.Plant || mongoose.model("Plant", plantSchema);
