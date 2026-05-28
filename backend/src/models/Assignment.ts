import mongoose, { Document, Schema } from 'mongoose';

// ── Types ───────────────────────────────────────
export type QuestionType = 'mcq' | 'short' | 'long' | 'true-false';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: Date;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
  fileUrl?: string;
  status: AssignmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ──────────────────────────────────────
const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    questionTypes: {
      type: [String],
      enum: ['mcq', 'short', 'long', 'true-false'],
      required: true,
    },
    numberOfQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String, default: '' },
    fileUrl: { type: String, required: false },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
