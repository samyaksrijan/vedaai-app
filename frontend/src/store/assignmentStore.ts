import { create } from 'zustand';
import axios from 'axios';

// ── TypeScript Types ────────────────────────────
export interface Question {
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  sectionLabel: string;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  assignmentId: string;
  sections: Section[];
  generatedAt: string;
}

export interface FormData {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: string[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions: string;
}

export interface AssignmentStore {
  formData: FormData;
  assignmentId: string | null;
  status: 'idle' | 'submitting' | 'pending' | 'processing' | 'completed' | 'failed';
  questionPaper: QuestionPaper | null;
  progress: number;
  error: string | null;

  setFormData: (data: Partial<FormData>) => void;
  submitAssignment: () => Promise<void>;
  setStatus: (status: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed') => void;
  setQuestionPaper: (paper: QuestionPaper | null) => void;
  setProgress: (n: number) => void;
  setError: (err: string | null) => void;
}

const defaultFormData: FormData = {
  title: '',
  subject: '',
  dueDate: '',
  questionTypes: [],
  numberOfQuestions: 0,
  totalMarks: 0,
  additionalInstructions: '',
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  formData: { ...defaultFormData },
  assignmentId: null,
  status: 'idle',
  questionPaper: null,
  progress: 0,
  error: null,

  setFormData: (data) =>
    set((s) => ({
      formData: { ...s.formData, ...data },
    })),

  submitAssignment: async () => {
    const { formData } = get();
    set({ status: 'submitting', error: null });

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      const response = await axios.post(`${apiBaseUrl}/api/assignments`, {
        title: formData.title,
        subject: formData.subject,
        dueDate: formData.dueDate,
        questionTypes: formData.questionTypes,
        numberOfQuestions: Number(formData.numberOfQuestions),
        totalMarks: Number(formData.totalMarks),
        additionalInstructions: formData.additionalInstructions,
      });

      const { assignmentId } = response.data;
      set({ assignmentId, status: 'processing', progress: 20 });
    } catch (err: any) {
      set({ status: 'failed', error: err.response?.data?.error || err.message });
      throw err;
    }
  },

  setStatus: (status) => set({ status }),
  setQuestionPaper: (questionPaper) => set({ questionPaper }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
}));
