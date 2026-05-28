import mongoose, { Document, Schema, Types } from 'mongoose';

// ── Types ───────────────────────────────────────
export interface IQuestion {
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  sectionLabel: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: Types.ObjectId;
  sections: ISection[];
  generatedAt: Date;
}

// ── Schemas ─────────────────────────────────────
const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    marks: { type: Number, required: true },
    sectionLabel: { type: String, required: true },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema<IQuestionPaper>(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    sections: { type: [SectionSchema], required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

export default mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
