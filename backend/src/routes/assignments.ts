import { Router, Request, Response } from 'express';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { assignmentQueue } from '../queue/assignmentQueue';
import fs from 'fs';

const router = Router();

// GET /api/assignments (listing all assignments for UI list compatibility)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json({ data: assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json({
      assignmentId: assignment._id,
      title: assignment.title,
      subject: assignment.subject,
      dueDate: assignment.dueDate,
      questionTypes: assignment.questionTypes,
      numberOfQuestions: assignment.numberOfQuestions,
      totalMarks: assignment.totalMarks,
      additionalInstructions: assignment.additionalInstructions,
      status: assignment.status,
      createdAt: assignment.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
});

// GET /api/assignments/:id/paper
router.get('/:id/paper', async (req: Request, res: Response) => {
  try {
    const paper = await QuestionPaper.findOne({ assignmentId: req.params.id });
    if (!paper) {
      return res.status(404).json({ error: 'Question paper not found for this assignment' });
    }
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch question paper' });
  }
});

// POST /api/assignments
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      title,
      subject,
      dueDate,
      questionTypes,
      numberOfQuestions,
      totalMarks,
      additionalInstructions,
      filePath,
    } = req.body;

    // ── Input Validations ───────────────────────────
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'title is required and must be a string' });
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return res.status(400).json({ error: 'subject is required and must be a string' });
    }
    if (!dueDate || isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'dueDate is required and must be a valid date' });
    }
    if (!Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ error: 'questionTypes must be a non-empty array' });
    }
    if (typeof numberOfQuestions !== 'number' || numberOfQuestions <= 0) {
      return res.status(400).json({ error: 'numberOfQuestions must be greater than 0' });
    }
    if (typeof totalMarks !== 'number' || totalMarks <= 0) {
      return res.status(400).json({ error: 'totalMarks must be greater than 0' });
    }

    // ── Save to MongoDB as pending ──────────────────
    const assignment = new Assignment({
      title,
      subject,
      dueDate: new Date(dueDate),
      questionTypes,
      numberOfQuestions,
      totalMarks,
      additionalInstructions: additionalInstructions || '',
      status: 'pending',
    });
    await assignment.save();

    // ── Read Reference Material ─────────────────────
    let fileContent = 'No file content available.';
    if (filePath && fs.existsSync(filePath)) {
      try {
        fileContent = fs.readFileSync(filePath, 'utf-8');
      } catch (fileErr) {
        console.warn('Could not read uploaded file path:', fileErr);
      }
    }

    // Map question types to rows
    const questionRows = questionTypes.map((type: string) => ({
      type,
      numQuestions: Math.max(1, Math.round(numberOfQuestions / questionTypes.length)),
      marks: Math.max(1, Math.round(totalMarks / numberOfQuestions)),
    }));

    // ── Add Job to BullMQ Queue ─────────────────────
    await assignmentQueue.add('generate', {
      assignmentId: assignment._id.toString(),
      fileContent,
      questionRows,
      additionalInfo: additionalInstructions || '',
    });

    // ── Return Response ─────────────────────────────
    res.status(201).json({
      assignmentId: assignment._id,
      message: 'Generation started',
    });
  } catch (err: any) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'Failed to create assignment and start generation' });
  }
});

export default router;
