// models/ChatConversation.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, enum: ['user', 'admin', 'system'], required: true },
    text: { type: String, required: true, maxlength: 2000 },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null if from user
    ts: { type: Date, default: Date.now },
    readByAdmin: { type: Boolean, default: false },
    readByUser: { type: Boolean, default: false },
  },
  { _id: true }
);

const ChatConversationSchema = new mongoose.Schema(
  {
    // Guest identity (required for guest sessions)
    guestName: { type: String, required: true, trim: true, maxlength: 80 },
    guestEmail: { type: String, trim: true, lowercase: true, maxlength: 120 },
    guestPhone: { type: String, trim: true, maxlength: 30 },

    // If the guest later registers, link the conversation
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Session token (opaque, sent back to the client)
    sessionToken: { type: String, required: true, unique: true, index: true },

    // Conversation state
    status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
    messages: { type: [MessageSchema], default: [] },

    // Metadata
    lastMessageAt: { type: Date, default: Date.now, index: true },
    lastMessagePreview: { type: String, default: '', maxlength: 140 },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 },

    // Presence
    online: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: Date.now },

    // Source tracking
    source: { type: String, default: 'contact-page' },
  },
  { timestamps: true }
);

ChatConversationSchema.index({ status: 1, lastMessageAt: -1 });
ChatConversationSchema.index({ guestEmail: 1 });

export default mongoose.model('ChatConversation', ChatConversationSchema);