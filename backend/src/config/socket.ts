import { Server as SocketIOServer, Socket } from 'socket.io';

export function registerSocketHandlers(io: SocketIOServer): void {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌  Client connected: ${socket.id}`);

    // Allow auto-join by assignmentId passed in connection handshake query params
    const assignmentId = socket.handshake.query.assignmentId as string;
    if (assignmentId) {
      socket.join(assignmentId);
      console.log(`🔌 Socket ${socket.id} auto-joined assignment room: ${assignmentId}`);
    }

    // Allow manual join by assignmentId (or room) via join event message
    socket.on('join', (room: string) => {
      socket.join(room);
      console.log(`🔌 Socket ${socket.id} manually joined room: ${room}`);
    });

    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`🔌 Socket ${socket.id} joined room (join-room): ${room}`);
    });

    // Retro-compatibility room joiner
    socket.on('join:job', (jobId: string) => {
      socket.join(`job:${jobId}`);
      console.log(`🔌 Socket ${socket.id} joined room job:${jobId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌  Client disconnected: ${socket.id}`);
    });
  });
}
