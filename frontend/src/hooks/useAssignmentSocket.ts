import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAssignmentStore } from '../store/assignmentStore';

export function useAssignmentSocket(assignmentId: string | null) {
  const setStatus = useAssignmentStore((s) => s.setStatus);
  const setQuestionPaper = useAssignmentStore((s) => s.setQuestionPaper);
  const setProgress = useAssignmentStore((s) => s.setProgress);

  useEffect(() => {
    if (!assignmentId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    
    // Connect to backend WebSocket with assignmentId as query parameter for auto-join
    const socket = io(socketUrl, {
      query: { assignmentId },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🔌 WebSocket hook connected');
      // Emit 'join-room' with the assignmentId explicitly
      socket.emit('join-room', assignmentId);
    });

    socket.on('generation-complete', (data: any) => {
      console.log('✅ Socket hook - generation complete:', data);
      if (data.assignmentId === assignmentId) {
        setStatus('completed');
        // Extract saved QuestionPaper result
        setQuestionPaper(data.result);
      }
    });

    socket.on('generation-failed', (data: any) => {
      console.error('❌ Socket hook - generation failed:', data);
      if (data.assignmentId === assignmentId) {
        setStatus('failed');
      }
    });

    socket.on('progress', (data: any) => {
      console.log('📈 Socket hook - progress:', data);
      if (typeof data === 'number') {
        setProgress(data);
      } else if (data && data.assignmentId === assignmentId) {
        setProgress(Number(data.value) || 0);
      }
    });

    return () => {
      console.log('🔌 WebSocket hook disconnecting on cleanup');
      socket.disconnect();
    };
  }, [assignmentId, setStatus, setQuestionPaper, setProgress]);
}
