import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  AppStoreState,
  Assignment,
  AssignmentFormData,
  ExamPaper,
  QuestionTypeRow,
  ActivePage,
} from "@/types";

// ── Seed Data ─────────────────────────────────
const seedAssignments: Assignment[] = [
  { id: "1", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "2", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "3", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "4", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "5", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "6", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "7", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "8", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "9", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
  { id: "10", title: "Quiz on Electricity", assignedOn: "20-06-2025", dueDate: "21-06-2025", status: "active" },
];

const defaultFormData: AssignmentFormData = {
  title: "",
  subject: "",
  uploadedFile: null,
  uploadedFileName: null,
  dueDate: "",
  questionRows: [
    { id: "row-1", type: "Multiple Choice Questions", numQuestions: 4, marks: 1 },
    { id: "row-2", type: "Short Questions", numQuestions: 3, marks: 2 },
    { id: "row-3", type: "Diagram/Graph-Based Questions", numQuestions: 5, marks: 5 },
    { id: "row-4", type: "Numerical Problems", numQuestions: 5, marks: 5 },
  ],
  additionalInfo: "",
};

const sampleExamPaper: ExamPaper = {
  schoolName: "Delhi Public School, Sector-4, Bokaro",
  subject: "English",
  className: "5th",
  timeAllowed: "45 minutes",
  maxMarks: 20,
  generalInstruction: "All questions are compulsory unless stated otherwise.",
  studentFields: ["Name", "Roll Number", "Class: 5th Section"],
  sections: [
    {
      id: "section-a",
      title: "Section A",
      subtitle: "Short Answer Questions",
      instruction: "Attempt all questions. Each question carries 2 marks",
      questions: [
        { number: 1, difficulty: "Easy", text: "Define electroplating. Explain its purpose.", marks: 2 },
        { number: 2, difficulty: "Moderate", text: "What is the role of a conductor in the process of electrolysis?", marks: 2 },
        { number: 3, difficulty: "Easy", text: "Why does a solution of copper sulfate conduct electricity?", marks: 2 },
        { number: 4, difficulty: "Moderate", text: "Describe one example of the chemical effect of electric current in daily life.", marks: 2 },
        { number: 5, difficulty: "Moderate", text: "Explain why electric current is said to have chemical effects.", marks: 2 },
        { number: 6, difficulty: "Challenging", text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.", marks: 2 },
        { number: 7, difficulty: "Challenging", text: "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.", marks: 2 },
        { number: 8, difficulty: "Easy", text: "Mention the type of current used in electroplating and justify why it is used.", marks: 2 },
        { number: 9, difficulty: "Moderate", text: "What is the importance of electric current in the field of metallurgy?", marks: 2 },
        { number: 10, difficulty: "Challenging", text: "Explain with a chemical equation how copper is deposited during the electroplating of an object.", marks: 2 },
      ],
    },
  ],
  answerKey: [
    { number: 1, answer: "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness." },
    { number: 2, answer: "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes." },
    { number: 3, answer: "Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity." },
    { number: 4, answer: "An example is the electroplating of silver on jewelry to prevent tarnishing." },
    { number: 5, answer: "Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects." },
    { number: 6, answer: "Sodium hydroxide is formed at the cathode during brine electrolysis as water gains electrons: 2H₂O + 2e⁻ → H₂ + 2OH⁻; Na⁺ + OH⁻ → NaOH (in solution)" },
    { number: 7, answer: "At the cathode: water is reduced to hydrogen gas and hydroxide ions. At the anode: water is oxidized to oxygen gas and hydrogen ions." },
    { number: 8, answer: "Direct current (DC) is used because it produces a consistent flow of electrons necessary for controlled deposition of metals." },
    { number: 9, answer: "Electric current helps extract metals from their ores and purify metals by electrolysis in metallurgy." },
    { number: 10, answer: "During copper electroplating, copper ions in the solution gain electrons and deposit as copper metal: Cu²⁺ + 2e⁻ → Cu (solid)" },
  ],
};

// ── Store ─────────────────────────────────────
let rowCounter = 5;

export const useAppStore = create<AppStoreState>()(
  devtools(
    (set, get) => ({
      // Navigation
      activePage: "assignments" as ActivePage,
      setActivePage: (page) => set({ activePage: page }),

      // Assignments
      assignments: seedAssignments,
      addAssignment: (assignment) =>
        set((s) => ({ assignments: [assignment, ...s.assignments] })),
      deleteAssignment: (id) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== id) })),
      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Form
      formData: { ...defaultFormData },
      setFormTitle: (title) =>
        set((s) => ({ formData: { ...s.formData, title } })),
      setFormSubject: (subject) =>
        set((s) => ({ formData: { ...s.formData, subject } })),
      setFormFile: (file) =>
        set((s) => ({
          formData: { ...s.formData, uploadedFile: file, uploadedFileName: file.name },
        })),
      setFormDueDate: (date) =>
        set((s) => ({ formData: { ...s.formData, dueDate: date } })),
      addQuestionRow: () => {
        const newRow: QuestionTypeRow = {
          id: `row-${++rowCounter}`,
          type: "Multiple Choice Questions",
          numQuestions: 1,
          marks: 1,
        };
        set((s) => ({
          formData: {
            ...s.formData,
            questionRows: [...s.formData.questionRows, newRow],
          },
        }));
      },
      removeQuestionRow: (id) =>
        set((s) => ({
          formData: {
            ...s.formData,
            questionRows: s.formData.questionRows.filter((r) => r.id !== id),
          },
        })),
      updateQuestionRow: (id, patch) =>
        set((s) => ({
          formData: {
            ...s.formData,
            questionRows: s.formData.questionRows.map((r) =>
              r.id === id ? { ...r, ...patch } : r
            ),
          },
        })),
      setAdditionalInfo: (info) =>
        set((s) => ({ formData: { ...s.formData, additionalInfo: info } })),
      resetForm: () => set({ formData: { ...defaultFormData } }),

      // Output
      examPaper: sampleExamPaper,
      setExamPaper: (paper) => set({ examPaper: paper }),
    }),
    { name: "VedaAI Store" }
  )
);
