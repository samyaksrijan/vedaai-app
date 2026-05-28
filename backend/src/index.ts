import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { registerSocketHandlers } from './config/socket';

// ── Routes ─────────────────────────────────────
import assignmentRoutes from './routes/assignments';
import uploadRoutes from './routes/upload';
import generateRoutes from './routes/generate';

// ── Workers ────────────────────────────────────
import './workers/generationWorker';

dotenv.config();

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ──────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);

// ── Middleware ─────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────
app.use('/api/assignments', assignmentRoutes);
app.use('/api/upload',      uploadRoutes);
app.use('/api/generate',    generateRoutes);

// ── 404 handler ────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Bootstrap ──────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;

(async () => {
  await connectDB();
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`🚀  VedaAI backend running on http://localhost:${PORT}`);
  });
})();

export { io };
