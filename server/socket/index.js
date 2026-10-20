// socket/index.js
import { Server } from 'socket.io';
import ChatConversation from '../models/ChatConversation.js';
import { verifySessionToken } from '../controllers/chatController.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // ── Handshake auth ──────────────────────────────
  io.use(async (socket, next) => {
    const { token, role } = socket.handshake.auth || {};

    if (role === 'admin') {
      // Admin socket: token is a JWT issued by your existing auth
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return next(new Error('Not admin'));
        socket.user = { role: 'admin', id: decoded.id, email: decoded.email };
        return next();
      } catch {
        return next(new Error('Admin auth failed'));
      }
    }

    // Guest socket: token is the sessionToken from /api/chat/session
    const conv = await verifySessionToken(token);
    if (!conv) return next(new Error('Invalid chat session'));
    socket.user = {
      role: 'guest',
      conversationId: conv._id.toString(),
      sessionToken: conv.sessionToken,
      name: conv.guestName,
      email: conv.guestEmail,
      phone: conv.guestPhone,
    };
    return next();
  });

  io.on('connection', async (socket) => {
    const u = socket.user;

    if (u.role === 'admin') {
      socket.join('admins');
      console.log(`[socket] admin connected: ${u.email}`);

      socket.on('disconnect', () => {
        console.log(`[socket] admin disconnected: ${u.email}`);
      });
      return;
    }

    // ── Guest connection ──────────────────────────
    const room = `guest:${u.sessionToken}`;
    socket.join(room);
    console.log(`[socket] guest connected: ${u.name} (${room})`);

    // Mark online + load history
    await ChatConversation.findByIdAndUpdate(u.conversationId, {
      online: true,
      lastSeenAt: new Date(),
    });
    const conv = await ChatConversation.findById(u.conversationId).lean();
    socket.emit('chat:history', conv?.messages || []);
    io.to('admins').emit('admin:presence', {
      id: u.conversationId,
      online: true,
    });

    // ── Guest sends a message ─────────────────────
    socket.on('chat:send', async ({ text }, ack) => {
      const clean = String(text || '').trim().slice(0, 2000);
      if (!clean) return ack?.({ error: 'Empty message' });

      try {
        const conv = await ChatConversation.findById(u.conversationId);
        if (!conv || conv.status === 'closed') {
          return ack?.({ error: 'Conversation is closed' });
        }

        const msg = { from: 'user', text: clean, ts: new Date() };
        conv.messages.push(msg);
        conv.lastMessageAt = new Date();
        conv.lastMessagePreview = clean.slice(0, 140);
        conv.unreadByAdmin += 1;
        await conv.save();

        const saved = conv.messages[conv.messages.length - 1].toObject();

        // Echo to guest (all tabs) + notify admins
        io.to(room).emit('chat:message', saved);
        io.to('admins').emit('admin:message:new', {
          conversationId: u.conversationId,
          guestName: conv.guestName,
          guestEmail: conv.guestEmail,
          guestPhone: conv.guestPhone,
          message: saved,
        });
        io.to('admins').emit('admin:conversation:updated', {
          id: conv._id,
          lastMessagePreview: conv.lastMessagePreview,
          lastMessageAt: conv.lastMessageAt,
          unreadByAdmin: conv.unreadByAdmin,
        });

        ack?.({ success: true, message: saved });
      } catch (err) {
        console.error('[socket chat:send]', err);
        ack?.({ error: 'Failed to send' });
      }
    });

    // ── Guest types (typing indicator) ────────────
    socket.on('chat:typing', (isTyping) => {
      io.to('admins').emit('admin:typing', {
        conversationId: u.conversationId,
        name: u.name,
        isTyping: !!isTyping,
      });
    });

    socket.on('disconnect', async () => {
      console.log(`[socket] guest disconnected: ${u.name}`);
      await ChatConversation.findByIdAndUpdate(u.conversationId, {
        online: false,
        lastSeenAt: new Date(),
      });
      io.to('admins').emit('admin:presence', {
        id: u.conversationId,
        online: false,
      });
    });
  });

  return io;
}

export function getIO() {
  return io;
}