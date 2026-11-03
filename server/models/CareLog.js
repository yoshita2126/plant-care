import mongoose from "mongoose";

const careLogSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", required: true, index: true },
  plantName: { type: String, required: true, trim: true },
  action: { type: String, default: "watered", trim: true },
  date: { type: Date, default: Date.now }
}, {
  versionKey: false,
  collection: "careLogs"
});

export default mongoose.models.CareLog || mongoose.model("CareLog", careLogSchema);
