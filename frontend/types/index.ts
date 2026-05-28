// ─────────────────────────────────────────────
//  VedaAI — Global Type Definitions
// ─────────────────────────────────────────────

// ── Nav ──────────────────────────────────────
export type NavItem = {
  id: string;
  label: string;
  icon: string; // lucide icon name
  badge?: number;
};

export type ActivePage =
  | "home"
  | "my-groups"
  | "assignments"
  | "ai-toolkit"
  | "my-library"
  | "create-assignment"
  | "assignment-output";

// ── Assignment ────────────────────────────────
export interface Assignment {
  id: string;
  title: string;
  assignedOn: string;  // "DD-MM-YYYY"
  dueDate: string;     // "DD-MM-YYYY"
  status: "active" | "draft" | "expired" | "pending" | "processing" | "completed" | "failed";
}

// ── Question Type Row (Creation Form) ─────────
export type QuestionCategory =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Long Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "True/False"
  | "Fill in the Blanks";

export interface QuestionTypeRow {
  id: string;
  type: QuestionCategory;
  numQuestions: number;
  marks: number;
}

// ── Creation Form State ───────────────────────
export interface AssignmentFormData {
  title: string;
  subject: string;
  uploadedFile: File | null;
  uploadedFileName: string | null;
  dueDate: string;
  questionRows: QuestionTypeRow[];
  additionalInfo: string;
}

// ── Output Paper ──────────────────────────────
export type Difficulty = "Easy" | "Moderate" | "Challenging";

export interface ExamQuestion {
  number: number;
  difficulty: Difficulty;
  text: string;
  marks: number;
}

export interface ExamSection {
  id: string;
  title: string;           // e.g. "Section A"
  subtitle: string;        // e.g. "Short Answer Questions"
  instruction: string;     // e.g. "Attempt all questions. Each question carries 2 marks"
  questions: ExamQuestion[];
}

export interface ExamPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstruction: string;
  studentFields: string[];  // ["Name", "Roll Number", "Class: 5th Section"]
  sections: ExamSection[];
  answerKey: AnswerKeyEntry[];
}

export interface AnswerKeyEntry {
  number: number;
  answer: string;
}

// ── Zustand Store Slices ──────────────────────
export interface AppStoreState {
  // Navigation
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Assignments list
  assignments: Assignment[];
  addAssignment: (assignment: Assignment) => void;
  deleteAssignment: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Creation form
  formData: AssignmentFormData;
  setFormTitle: (title: string) => void;
  setFormSubject: (subject: string) => void;
  setFormFile: (file: File) => void;
  setFormDueDate: (date: string) => void;
  addQuestionRow: () => void;
  removeQuestionRow: (id: string) => void;
  updateQuestionRow: (id: string, patch: Partial<QuestionTypeRow>) => void;
  setAdditionalInfo: (info: string) => void;
  resetForm: () => void;

  // Output paper
  examPaper: ExamPaper | null;
  setExamPaper: (paper: ExamPaper) => void;
}
