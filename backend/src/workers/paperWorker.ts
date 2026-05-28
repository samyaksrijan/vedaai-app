import { Worker, Job } from 'bullmq';
import fs from 'fs';
import { generateExamPaper } from '../services/openaiService';
import { io } from '../index';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';

const bullmqConnection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
};

interface PaperJobData {
  filePath:       string;
  dueDate:        string;
  questionRows:   { type: string; numQuestions: number; marks: number }[];
  additionalInfo: string;
  assignmentId?:  string;
}

const worker = new Worker<PaperJobData>(
  'paper-generation',
  async (job: Job<PaperJobData>) => {
    const { filePath, questionRows, additionalInfo, assignmentId } = job.data;

    // Emit progress to the client listening on this job room
    const emit = (event: string, payload: unknown) =>
      io.to(`job:${job.id}`).emit(event, payload);

    if (assignmentId) {
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
    }

    emit('job:progress', { step: 'reading-file', pct: 10 });

    // Read uploaded file content
    const fileContent = fs.existsSync(filePath)
      ? fs.readFileSync(filePath, 'utf-8')
      : 'No file content available.';

    emit('job:progress', { step: 'generating', pct: 40 });

    // Call OpenAI
    const examPaper = await generateExamPaper({ fileContent, questionRows, additionalInfo });

    emit('job:progress', { step: 'saving', pct: 80 });

    // Persist to MongoDB if assignmentId is provided
    if (assignmentId) {
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
      
      const rawSections = (examPaper.sections || []) as any[];
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

      await QuestionPaper.create({
        assignmentId,
        sections,
        generatedAt: new Date(),
      });
    }

    emit('job:done', { examPaper });
    emit('job:progress', { step: 'complete', pct: 100 });

    return examPaper;
  },
  { connection: bullmqConnection }
);

worker.on('failed', async (job, err) => {
  console.error(`❌  Job ${job?.id} failed:`, err.message);
  io.to(`job:${job?.id}`).emit('job:error', { message: err.message });
  if (job?.data?.assignmentId) {
    try {
      await Assignment.findByIdAndUpdate(job.data.assignmentId, { status: 'failed' });
    } catch (e) {
      console.error('Failed to update assignment status to failed:', e);
    }
  }
});

export default worker;
