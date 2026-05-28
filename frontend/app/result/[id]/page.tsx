'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAssignmentStore } from '@/src/store/assignmentStore';
import { useAssignmentSocket } from '@/src/hooks/useAssignmentSocket';
import { exportQuestionPaper } from '@/src/utils/exportPdf';
import axios from 'axios';
import {
  Clock,
  Award,
  Download,
  RotateCcw,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = (params?.id as string) || null;

  const status = useAssignmentStore((s) => s.status);
  const setStatus = useAssignmentStore((s) => s.setStatus);
  const progress = useAssignmentStore((s) => s.progress);
  const setProgress = useAssignmentStore((s) => s.setProgress);
  const questionPaper = useAssignmentStore((s) => s.questionPaper);
  const setQuestionPaper = useAssignmentStore((s) => s.setQuestionPaper);
  const error = useAssignmentStore((s) => s.error);
  const setError = useAssignmentStore((s) => s.setError);

  // 1. Hook up WebSocket listeners
  useAssignmentSocket(assignmentId);

  // 2. Poll fallback + initial load
  useEffect(() => {
    if (!assignmentId) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchPaper = async () => {
      try {
        const assignmentRes = await axios.get(`${apiBaseUrl}/api/assignments/${assignmentId}`);
        const currentStatus = assignmentRes.data.status;
        setStatus(currentStatus);

        if (currentStatus === 'completed') {
          setProgress(100);
          const paperRes = await axios.get(`${apiBaseUrl}/api/assignments/${assignmentId}/paper`);
          setQuestionPaper(paperRes.data);
        } else if (currentStatus === 'failed') {
          setStatus('failed');
          setError('OpenAI paper generation failed on the server.');
        } else if (currentStatus === 'processing' || currentStatus === 'pending') {
          // Increment progress step-wise to give dynamic loading feel
          const currentProgress = useAssignmentStore.getState().progress;
          setProgress(Math.min(95, currentProgress + 15));
        }
      } catch (err: any) {
        console.error('Failed status fetching check:', err);
      }
    };

    fetchPaper();

    // Poll fallback every 3 seconds
    const interval = setInterval(() => {
      const activeState = useAssignmentStore.getState().status;
      if (activeState === 'completed' || activeState === 'failed') {
        clearInterval(interval);
        return;
      }
      fetchPaper();
    }, 3000);

    return () => clearInterval(interval);
  }, [assignmentId, setStatus, setQuestionPaper, setProgress, setError]);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">Easy</span>;
      case 'medium':
      case 'moderate':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">Medium</span>;
      case 'hard':
      case 'challenging':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">Hard</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">Easy</span>;
    }
  };

  // ─── 1. LOADING STATE ───
  if (status === 'idle' || status === 'submitting' || status === 'processing' || status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans select-none">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Concentric rotating loaders */}
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-sm font-black text-indigo-700">{progress}%</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Generating Question Paper</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              Our AI engine is scanning upload materials, structuring sections, and drafting questions...
            </p>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
            <div
              className="bg-indigo-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── 2. FAILED STATE ───
  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans select-none">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center flex flex-col items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center shadow-sm">
            <AlertCircle size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Generation Failed</h2>
            <p className="text-xs text-red-500 mt-1.5 leading-relaxed">
              {error || 'We could not successfully parse the question sheet structure. Verify your AI key or prompt.'}
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-100 cursor-pointer transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── 3. COMPLETED STATE ───
  const sections = questionPaper?.sections || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* ── Sticky Top Action Bar ──────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-base font-extrabold text-gray-900 tracking-tight">
              Assessment Output
            </h1>
            <p className="text-[10px] text-gray-500">
              Exam sheet generated and saved. Preview below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl bg-white shadow-sm cursor-pointer transition-colors"
          >
            <RotateCcw size={14} />
            Regenerate
          </button>
          <button
            onClick={() => {
              if (questionPaper) {
                exportQuestionPaper(questionPaper, useAssignmentStore.getState().formData.title || 'Assignment');
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 cursor-pointer transition-colors"
          >
            <Download size={14} />
            Download PDF
          </button>
        </div>
      </div>

      {/* ── Main Exam Sheet Area ────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8 md:p-12 select-text min-h-[900px] flex flex-col gap-6">
          {/* Centered Bold Headers */}
          <div className="flex flex-col items-center text-center border-b-2 border-double border-gray-800 pb-5">
            <h2 className="text-xl font-extrabold uppercase tracking-tight text-gray-950">
              VedaAI Global School
            </h2>
            <h3 className="text-sm font-extrabold text-gray-700 mt-1 uppercase tracking-wider">
              Weekly Assessment Paper
            </h3>
          </div>

          {/* Details & Stats row */}
          <div className="grid grid-cols-3 gap-4 border border-gray-200 bg-gray-50/50 rounded-xl p-4 text-xs font-medium text-gray-700">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Subject</p>
              <p className="text-gray-900 font-semibold mt-0.5">Physics</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Date</p>
              <p className="text-gray-900 font-semibold mt-0.5">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Total Marks</p>
              <p className="text-gray-900 font-semibold mt-0.5">50 Marks</p>
            </div>
          </div>

          {/* Blank-line student info fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border border-dashed border-gray-200 rounded-xl p-4 text-xs text-gray-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span>Name:</span>
              <div className="flex-1 border-b border-gray-300 border-dotted min-h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>Roll Number:</span>
              <div className="flex-1 border-b border-gray-300 border-dotted min-h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span>Section:</span>
              <div className="flex-1 border-b border-gray-300 border-dotted min-h-4" />
            </div>
          </div>

          {/* Sections mapping */}
          <div className="flex flex-col gap-8 mt-4">
            {sections.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-8">
                No questions returned in the paper structure.
              </div>
            ) : (
              sections.map((section, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-4">
                  {/* Section Title */}
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-black uppercase tracking-wide text-gray-900 underline decoration-indigo-500 decoration-2 underline-offset-4">
                      {section.title}
                    </h4>
                    {section.instruction && (
                      <p className="text-[11px] italic text-gray-500 mt-1.5">
                        {section.instruction}
                      </p>
                    )}
                  </div>

                  {/* Section Questions */}
                  <div className="flex flex-col gap-4 ml-1">
                    {section.questions.map((question, qIdx) => (
                      <div
                        key={qIdx}
                        className="group flex items-start justify-between gap-4 text-xs md:text-sm text-gray-800"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="font-extrabold text-gray-950">Q.{qIdx + 1}.</span>
                          <div className="flex flex-col gap-1.5">
                            <p className="font-medium leading-relaxed">{question.text}</p>
                            <div className="flex items-center gap-2">
                              {getDifficultyBadge(question.difficulty)}
                              <span className="text-[9px] font-bold text-gray-400 uppercase">
                                Type: {question.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right-aligned Marks badge */}
                        <span className="font-bold text-gray-900 select-none flex-shrink-0 pt-0.5 whitespace-nowrap">
                          [{question.marks} mark{question.marks > 1 ? 's' : ''}]
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
