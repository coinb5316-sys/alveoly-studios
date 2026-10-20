// controllers/chatController.js
import crypto from 'crypto';
import ChatConversation from '../models/ChatConversation.js';
import { getIO } from '../socket/index.js';

/* ─────────────────────────────────────────────
   PUBLIC: Start a guest chat session
   Requires: name + (email OR phone)
   Returns: sessionToken + conversation (without other users' data)
   ───────────────────────────────────────────── */
export const startGuestSession = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!email && !phone) {
      return res.status(400).json({ error: 'Please provide an email or phone number.' });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Reuse an open conversation for the same email if one exists (within 24h)
    if (email) {
      const recent = await ChatConversation.findOne({
        guestEmail: email.toLowerCase(),
        status: 'open',
        updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).sort({ updatedAt: -1 });

      if (recent) {
        return res.json({
          sessionToken: recent.sessionToken,
          conversation: {
            id: recent._id,
            guestName: recent.guestName,
            guestEmail: recent.guestEmail,
            guestPhone: recent.guestPhone,
            status: recent.status,
          },
          resumed: true,
        });
      }
    }

    const sessionToken = crypto.randomBytes(24).toString('hex');

    const conversation = await ChatConversation.create({
      guestName: name.trim(),
      guestEmail: email ? email.trim().toLowerCase() : undefined,
      guestPhone: phone ? phone.trim() : undefined,
      sessionToken,
      messages: [
        {
          from: 'system',
          text: `Hi ${name.trim().split(' ')[0]} 👋 — welcome to Alveoly Studios. Our team usually replies within a few minutes.`,
        },
      ],
      lastMessagePreview: 'New conversation',
    });

    // Notify admins in real time
    const io = getIO();
    if (io) {
      io.to('admins').emit('admin:conversation:new', {
        id: conversation._id,
        guestName: conversation.guestName,
        guestEmail: conversation.guestEmail,
        guestPhone: conversation.guestPhone,
        lastMessagePreview: 'New conversation',
        lastMessageAt: conversation.lastMessageAt,
        online: true,
        status: 'open',
      });
    }

    res.status(201).json({
      sessionToken,
      conversation: {
        id: conversation._id,
        guestName: conversation.guestName,
        guestEmail: conversation.guestEmail,
        guestPhone: conversation.guestPhone,
        status: conversation.status,
        messages: conversation.messages,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────
   PUBLIC: Verify a session token (used by socket handshake)
   ───────────────────────────────────────────── */
export const verifySessionToken = async (token) => {
  if (!token) return null;
  return ChatConversation.findOne({ sessionToken: token, status: 'open' });
};

/* ─────────────────────────────────────────────
   ADMIN: List conversations
   ───────────────────────────────────────────── */
export const listConversations = async (req, res, next) => {
  try {
    const { status = 'open', search = '', page = 1, limit = 30 } = req.query;
    const filter = {};
    if (status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { guestName: { $regex: search, $options: 'i' } },
        { guestEmail: { $regex: search, $options: 'i' } },
        { guestPhone: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      ChatConversation.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      ChatConversation.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────
   ADMIN: Get single conversation + messages
   ───────────────────────────────────────────── */
export const getConversation = async (req, res, next) => {
  try {
    const conv = await ChatConversation.findById(req.params.id).lean();
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    res.json(conv);
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────
   ADMIN: Reply via REST (fallback if socket is down)
   ───────────────────────────────────────────── */
export const adminReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Message text required' });

    const conv = await ChatConversation.findById(id);
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });
    if (conv.status === 'closed') return res.status(400).json({ error: 'Conversation is closed' });

    const msg = {
      from: 'admin',
      text: text.trim().slice(0, 2000),
      adminId: req.user?._id,
      ts: new Date(),
    };
    conv.messages.push(msg);
    conv.lastMessageAt = new Date();
    conv.lastMessagePreview = msg.text.slice(0, 140);
    conv.unreadByUser += 1;
    await conv.save();

    const io = getIO();
    if (io) {
      io.to(`guest:${conv.sessionToken}`).emit('chat:message', msg);
      io.to('admins').emit('admin:conversation:updated', {
        id: conv._id,
        lastMessagePreview: conv.lastMessagePreview,
        lastMessageAt: conv.lastMessageAt,
      });
    }

    res.json({ success: true, message: msg });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────
   ADMIN: Mark conversation read / close
   ───────────────────────────────────────────── */
export const markRead = async (req, res, next) => {
  try {
    const conv = await ChatConversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Not found' });
    conv.unreadByAdmin = 0;
    conv.messages.forEach((m) => {
      if (m.from === 'user') m.readByAdmin = true;
    });
    await conv.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const closeConversation = async (req, res, next) => {
  try {
    const conv = await ChatConversation.findById(req.params.id);
    if (!conv) return res.status(404).json({ error: 'Not found' });
    conv.status = 'closed';
    conv.online = false;
    await conv.save();

    const io = getIO();
    if (io) {
      io.to(`guest:${conv.sessionToken}`).emit('chat:closed');
      io.to('admins').emit('admin:conversation:closed', { id: conv._id });
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};