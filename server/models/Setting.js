import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., 'pricing_image'
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // e.g., 5
  description: { type: String },
});

export default mongoose.model('Setting', SettingSchema);