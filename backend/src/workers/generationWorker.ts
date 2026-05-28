import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { generateExamPaper } from '../services/openaiService';
import { io } from '../index';

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

// BullMQ requires a dedicated Redis connection with maxRetriesPerRequest: null
const workerConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

export interface GenerationJobData {
  assignmentId: string;
  fileContent: string;
  questionRows: { type: string; numQuestions: number; marks: number }[];
  additionalInfo?: string;
}

const worker = new Worker<GenerationJobData>(
  'assignment-generation',
  async (job: Job<GenerationJobData>) => {
    const { assignmentId, fileContent, questionRows, additionalInfo } = job.data;

    try {
      // 1. Set status to processing
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      io.to(assignmentId).emit('progress', { assignmentId, value: 35 });
      io.emit('progress', { assignmentId, value: 35 });

      // 2. Call AI generation function
      const examPaperResult = await generateExamPaper({
        fileContent,
        questionRows,
        additionalInfo,
      });
      io.to(assignmentId).emit('progress', { assignmentId, value: 75 });
      io.emit('progress', { assignmentId, value: 75 });

      // 3. Normalize sections and questions for Mongoose
      const rawSections = (examPaperResult.sections || []) as any[];
      const sections = rawSections.map((sec) => ({
        title: sec.title || 'Section',
        instruction: sec.instruction || '',
        questions: (sec.questions || []).map((q: any) => ({
          text: q.text || '',
          type: q.type || 'MCQ',
          difficulty: q.difficulty?.toLowerCase() === 'challenging' ? 'hard' : q.difficulty?.toLowerCase() === 'moderate' ? 'medium' : 'easy',
          marks: Number(q.marks) || 1,
          sectionLabel: sec.title || 'Section',
        })),
      }));

      // 4. Save QuestionPaper to MongoDB
      const savedPaper = await QuestionPaper.create({
        assignmentId,
        sections,
        generatedAt: new Date(),
      });
      io.to(assignmentId).emit('progress', { assignmentId, value: 90 });
      io.emit('progress', { assignmentId, value: 90 });

      // 5. Update Assignment status to 'completed'
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
      io.to(assignmentId).emit('progress', { assignmentId, value: 100 });
      io.emit('progress', { assignmentId, value: 100 });

      // 6. Emit WebSocket event 'generation-complete'
      io.to(assignmentId).emit('generation-complete', {
        assignmentId,
        result: savedPaper,
      });
      io.emit('generation-complete', {
        assignmentId,
        result: savedPaper,
      });

      return examPaperResult;
    } catch (err: any) {
      console.error(`❌ Worker Job ${job.id} failed:`, err.message);

      // Set Assignment status to 'failed'
      try {
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
      } catch (dbErr) {
        console.error('Failed to update status on DB failure:', dbErr);
      }

      // Emit 'generation-failed' event
      io.emit('generation-failed', {
        assignmentId,
        error: err.message,
      });

      throw err;
    }
  },
  {
    connection: workerConnection as any,
  }
);

// Worker-level global failure hook (e.g. if job times out or crashes before entering try/catch)
worker.on('failed', async (job, err) => {
  console.error(`❌ BullMQ Job ${job?.id} failed globally:`, err.message);
  if (job?.data?.assignmentId) {
    try {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
      io.emit('generation-failed', {
        assignmentId: job.data.assignmentId,
        error: err.message,
      });
    } catch (e) {
      console.error('Failed to update assignment status to failed globally:', e);
    }
  }
});

export default worker;
