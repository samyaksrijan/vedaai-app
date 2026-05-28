import { Router, Request, Response } from 'express';
import { Queue } from 'bullmq';

const bullmqConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

const router = Router();

// POST /api/generate
// Enqueues an AI paper generation job and returns jobId for socket tracking
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      filePath,
      dueDate,
      questionRows,
      additionalInfo,
      assignmentId,
    } = req.body;

    if (!filePath || !questionRows?.length) {
      return res.status(400).json({ error: 'filePath and questionRows are required' });
    }

    const paperQueue = new Queue('paper-generation', {
      connection: bullmqConnection,
    });

    const job = await paperQueue.add('generate', {
      filePath,
      dueDate,
      questionRows,
      additionalInfo,
      assignmentId,
    });

    res.json({ jobId: job.id, message: 'Job enqueued — listen via socket' });
  } catch (err) {
    console.error('Generate route error:', err);
    res.status(500).json({ error: 'Failed to enqueue generation job' });
  }
});

export default router;
