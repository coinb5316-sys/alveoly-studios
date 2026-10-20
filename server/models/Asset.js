import mongoose from 'mongoose';

const AssetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true,
    },
    prompt: { type: String, default: '' },
    cloudinaryUrl: { type: String, required: true },

    // ── Generation metadata for editing / re-running ──
    kind: {
      type: String,
      // matches the queue kind: image | video | image-to-video | video-to-video | audio | voice-clone
      default: 'image',
    },
    model: { type: String, default: '' },
    style: { type: String, default: '' },
    aspectRatio: { type: String, default: '' },
    resolution: { type: String, default: '' },
    duration: { type: Number },
    seed: { type: Number },
    guidance: { type: Number },
    negativePrompt: { type: String, default: '' },
    voice: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    extra: { type: mongoose.Schema.Types.Mixed }, // catch-all for future fields
  },
  { timestamps: true }
);

// Fast lookups for the library + stats
AssetSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model('Asset', AssetSchema);