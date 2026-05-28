'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
  Upload,
  Plus,
  Trash2,
  Calendar,
  Layers,
  FileDown,
  X,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import axios from 'axios';
import type { QuestionCategory } from '@/types';

const QUESTION_CATEGORIES: QuestionCategory[] = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False',
  'Fill in the Blanks',
];

export default function CreateAssignmentForm() {
  const formData = useAppStore((s) => s.formData);
  const setFormTitle = useAppStore((s) => s.setFormTitle);
  const setFormSubject = useAppStore((s) => s.setFormSubject);
  const setFormFile = useAppStore((s) => s.setFormFile);
  const setFormDueDate = useAppStore((s) => s.setFormDueDate);
  const addQuestionRow = useAppStore((s) => s.addQuestionRow);
  const removeQuestionRow = useAppStore((s) => s.removeQuestionRow);
  const updateQuestionRow = useAppStore((s) => s.updateQuestionRow);
  const setAdditionalInfo = useAppStore((s) => s.setAdditionalInfo);
  const resetForm = useAppStore((s) => s.resetForm);
  const addAssignment = useAppStore((s) => s.addAssignment);
  const setActivePage = useAppStore((s) => s.setActivePage);

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic calculations
  const totalQuestions = formData.questionRows.reduce(
    (sum, row) => sum + row.numQuestions,
    0
  );
  const totalMarks = formData.questionRows.reduce(
    (sum, row) => sum + row.numQuestions * row.marks,
    0
  );

  // File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelection(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleFileSelection = (file: File) => {
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`File type not allowed. Please upload one of: ${allowedExtensions.join(', ')}`);
      return;
    }
    setError(null);
    setFormFile(file);
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    useAppStore.setState((state) => ({
      formData: { ...state.formData, uploadedFile: null, uploadedFileName: null },
    }));
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!formData.title || !formData.dueDate) {
      setError('Please fill in Assignment Title and Due Date.');
      return;
    }

    if (formData.questionRows.length === 0) {
      setError('Please add at least one question row.');
      return;
    }

    setLoading(true);
    setError(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
      let fileUrl = '';
      let serverFilePath = 'No file content available.';

      // 1. Upload file if present
      if (formData.uploadedFile) {
        const uploadData = new FormData();
        uploadData.append('file', formData.uploadedFile);
        const uploadRes = await axios.post(`${apiBaseUrl}/api/upload`, uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        serverFilePath = uploadRes.data.data.path;
        fileUrl = `${apiBaseUrl}/uploads/${uploadRes.data.data.filename}`;
      }

      // Map questionTypes friendly enums
      const mappedQuestionTypes = Array.from(
        new Set(
          formData.questionRows.map((r) => {
            if (r.type === 'Multiple Choice Questions') return 'mcq';
            if (r.type === 'Short Questions') return 'short';
            if (r.type === 'Long Questions') return 'long';
            if (r.type === 'True/False') return 'true-false';
            return 'short';
          })
        )
      );

      // Default subject to "Science" for science assignment mock compatibility
      const subject = formData.subject || 'Science';

      // 2. Create Assignment in MongoDB
      const assignmentPayload = {
        title: formData.title,
        subject,
        dueDate: new Date(formData.dueDate),
        questionTypes: mappedQuestionTypes,
        numberOfQuestions: totalQuestions,
        totalMarks,
        additionalInstructions: formData.additionalInfo,
        fileUrl,
        status: 'pending',
      };

      const assignmentRes = await axios.post(
        `${apiBaseUrl}/api/assignments`,
        assignmentPayload
      );
      const newAssignment = assignmentRes.data.data;

      // Add to store
      addAssignment({
        id: newAssignment._id,
        title: newAssignment.title,
        assignedOn: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
        dueDate: new Date(newAssignment.dueDate)
          .toLocaleDateString('en-GB')
          .replace(/\//g, '-'),
        status: 'processing', // Show visually in list
      });

      // 3. Trigger BullMQ paper generation job
      const generatePayload = {
        filePath: serverFilePath,
        dueDate: formData.dueDate,
        questionRows: formData.questionRows.map((r) => ({
          type: r.type,
          numQuestions: r.numQuestions,
          marks: r.marks,
        })),
        additionalInfo: formData.additionalInfo,
        assignmentId: newAssignment._id,
      };

      await axios.post(`${apiBaseUrl}/api/generate`, generatePayload);

      // Reset form and go back to assignments
      resetForm();
      setActivePage('assignments');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          'Failed to create assignment. Please make sure the backend server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Mobile Responsive View ──
  if (isMobile) {
    return (
      <div className="max-w-md mx-auto animate-fade-in pb-24 font-sans select-none">
        {/* Stepper bar */}
        <div className="flex items-center gap-1.5 w-full mb-4">
          <div className="h-1 bg-gray-800 rounded-full flex-1 transition-all duration-300" style={{ width: '60%' }} />
          <div className="h-1 bg-gray-200 rounded-full flex-1" />
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-650 text-xs flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Mobile Main Form Card */}
        <div className="bg-white shadow-sm rounded-3xl p-5 flex flex-col gap-5">
          {/* Card Header */}
          <div>
            <h2 className="text-base font-extrabold font-bricolage text-[#303030]">Assignment Details</h2>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">Basic information about your assignment</p>
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity"
              value={formData.title}
              onChange={(e) => setFormTitle(e.target.value)}
              className="px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 text-xs outline-none focus:border-gray-400 text-gray-800 font-medium font-bricolage"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Science"
              value={formData.subject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 text-xs outline-none focus:border-gray-400 text-gray-800 font-medium font-bricolage"
            />
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            className={`border border-dashed border-gray-300 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
              dragging ? 'border-orange-500 bg-orange-50/20' : 'bg-white hover:bg-gray-50/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('mobile-upload-trigger')?.click()}
          >
            <input
              id="mobile-upload-trigger"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            {formData.uploadedFileName ? (
              <div className="flex flex-col items-center gap-1">
                <FileDown size={20} className="text-orange-650" />
                <p className="text-xs font-bold text-gray-800 font-bricolage">{formData.uploadedFileName}</p>
                <button type="button" onClick={handleClearFile} className="mt-1 px-3 py-1 bg-red-50 text-red-650 text-[10px] rounded-lg">
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 select-none">
                <Upload size={20} className="text-gray-400" />
                <p className="text-xs font-bold text-gray-800 font-bricolage">Choose a file or drag & drop it here</p>
                <p className="text-[10px] text-gray-400 font-bricolage">JPEG, PNG, upto 10MB</p>
                <button type="button" className="mt-1 px-4 py-1.5 bg-[#F6F6F6] text-gray-700 text-xs font-bold rounded-full">
                  Browse Files
                </button>
              </div>
            )}
          </div>
          <p className="text-[10px] text-center text-gray-400 -mt-2 font-bricolage leading-[140%]">
            Upload images of your preferred document/image
          </p>

          {/* Due Date picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Due Date
            </label>
            <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-full focus-within:border-gray-400 transition-colors">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="bg-transparent outline-none text-xs flex-1 text-gray-800 font-semibold font-bricolage"
                required
              />
              <Calendar size={14} className="text-gray-400" />
            </div>
          </div>

          {/* Question Types List */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Question Type
            </label>

            <div className="flex flex-col gap-4">
              {formData.questionRows.map((row) => (
                <div key={row.id} className="flex flex-col gap-2.5 border border-gray-200/50 p-4 rounded-3xl bg-white shadow-sm">
                  {/* Select Dropdown row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 relative">
                      <select
                        value={row.type}
                        onChange={(e) =>
                          updateQuestionRow(row.id, { type: e.target.value as QuestionCategory })
                        }
                        className="w-full bg-white border border-gray-200 rounded-full px-4 py-2.5 text-xs outline-none text-[#303030] font-bricolage font-semibold appearance-none pr-8 cursor-pointer"
                      >
                        {QUESTION_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                      type="button"
                      disabled={formData.questionRows.length <= 1}
                      onClick={() => removeQuestionRow(row.id)}
                      className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Mobile Side-by-side Counters Wrapper */}
                  <div className="bg-[#F3F4F6]/50 border border-gray-100 rounded-2xl p-3 flex justify-between gap-4">
                    {/* No. of Questions Counter */}
                    <div className="flex flex-col gap-1 items-center flex-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-bricolage">No. of Questions</span>
                      <div className="flex items-center bg-white rounded-full px-2 py-1 gap-2 border border-gray-200 w-[100px] h-[36px] justify-between">
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                          onClick={() => updateQuestionRow(row.id, { numQuestions: Math.max(1, row.numQuestions - 1) })}
                        >
                          -
                        </button>
                        <span className="text-xs font-extrabold text-[#303030] min-w-4 text-center font-bricolage">{row.numQuestions}</span>
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                          onClick={() => updateQuestionRow(row.id, { numQuestions: row.numQuestions + 1 })}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Marks Counter */}
                    <div className="flex flex-col gap-1 items-center flex-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase font-bricolage">Marks</span>
                      <div className="flex items-center bg-white rounded-full px-2 py-1 gap-2 border border-gray-200 w-[100px] h-[36px] justify-between">
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                          onClick={() => updateQuestionRow(row.id, { marks: Math.max(1, row.marks - 1) })}
                        >
                          -
                        </button>
                        <span className="text-xs font-extrabold text-[#303030] min-w-4 text-center font-bricolage">{row.marks}</span>
                        <button
                          type="button"
                          className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                          onClick={() => updateQuestionRow(row.id, { marks: row.marks + 1 })}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addQuestionRow}
              className="mt-2 self-start flex items-center gap-2 text-xs font-bold text-[#303030] select-none hover:opacity-85"
            >
              <span className="w-6 h-6 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-sm">+</span>
              Add Question Type
            </button>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col items-end text-xs text-gray-600 gap-1 pr-1 font-bricolage tracking-tight font-medium">
            <div>
              Total Questions : <span className="font-extrabold text-[#303030]">{totalQuestions}</span>
            </div>
            <div>
              Total Marks : <span className="font-extrabold text-[#303030]">{totalMarks}</span>
            </div>
          </div>

          {/* Additional Info Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Additional Information (For better output)
            </label>
            <div className="relative">
              <textarea
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                rows={3}
                value={formData.additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                className="w-full bg-gray-50/30 border border-gray-200 rounded-2xl p-4 text-xs outline-none text-gray-800 font-bricolage"
              />
              <button
                type="button"
                className="absolute right-3.5 bottom-3.5 w-9 h-9 rounded-full bg-[#F0F0F0] border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#303030] transition-all duration-200"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex justify-between items-center mt-5 gap-4">
          <button
            type="button"
            onClick={() => setActivePage('assignments')}
            className="flex items-center justify-center gap-1.5 px-6 py-3 border border-gray-200 hover:bg-gray-50 text-[#303030] text-xs font-bold rounded-full bg-white transition-all cursor-pointer flex-1"
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-create-assignment flex items-center justify-center gap-1.5 transition-all duration-300 flex-1"
            style={{
              height: '46px',
              borderRadius: '48px',
              background: '#181818',
              border: '1.5px solid transparent',
              backgroundImage: 'linear-gradient(#181818, #181818), linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(102, 102, 102, 0) 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
            }}
          >
            {loading ? (
              <span className="animate-pulse">Generating...</span>
            ) : (
              <>
                Next
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Desktop View (Replicating Figma specs: Width 810, bg white 50% opacity, Bricolage typography) ──
  return (
    <div className="max-w-[1103px] mx-auto animate-fade-in pb-16 select-none font-sans">
      {/* ── Top Header Section (width: 1103, height: 66) ── */}
      <div className="flex items-center gap-4 p-2 mb-6" style={{ height: '66px' }}>
        {/* Content positioning wrapper (width: 293, height: 50) */}
        <div className="flex items-center gap-3" style={{ width: '293px', height: '50px' }}>
          {/* Green Indicator Circle */}
          <div
            className="rounded-full flex-shrink-0 animate-[pulse_2s_infinite]"
            style={{
              width: '12px',
              height: '12px',
              background: '#4BC26D',
              border: '4px solid rgba(75, 194, 109, 0.4)',
              boxShadow: '0px 32px 48px 0px rgba(0,0,0,0.2), 0px 16px 48px 0px rgba(0,0,0,0.12)',
            }}
          />
          <div>
            <h1
              className="font-bricolage text-[20px] font-bold tracking-tight text-[#303030] leading-[140%] select-none"
              style={{ width: '174px', height: '28px' }}
            >
              Create Assignment
            </h1>
            <p
              className="font-bricolage text-[14px] text-[#5E5E5E8C] font-normal leading-[140%] select-none"
              style={{ width: '261px', height: '20px' }}
            >
              Set up a new assignment for your students
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-[810px] mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-650 text-xs flex items-start gap-2.5 shadow-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Main Details Dialogue Box Card (width: 1100, height: auto/dynamic) ── */}
      <div
        className="w-full max-w-[1100px] mx-auto shadow-sm flex flex-col gap-8 select-text"
        style={{
          borderRadius: '32px', // SDS Light L radius
          padding: '32px',
          background: '#FFFFFF80', // 50% opacity blurred white
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Card Title Header Section */}
        <div className="flex flex-col gap-[2px]" style={{ width: '251px', height: '50px' }}>
          <h2 className="text-base font-bold font-bricolage text-[#303030]">Assignment Details</h2>
          <p className="text-xs text-gray-500 font-medium">Basic information about your assignment</p>
        </div>

        {/* ── Title & Subject Inputs ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Assignment Title
            </label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity"
              value={formData.title}
              onChange={(e) => setFormTitle(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/70 text-xs outline-none focus:border-gray-400 text-gray-800 font-medium font-bricolage"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Science"
              value={formData.subject}
              onChange={(e) => setFormSubject(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/70 text-xs outline-none focus:border-gray-400 text-gray-800 font-medium font-bricolage"
            />
          </div>
        </div>

        {/* ── File Upload Zone (width: 100%, height: 236) ── */}
        <div className="flex flex-col gap-2 w-full">
          <div
            className={`border border-dashed border-gray-300 flex flex-col items-center justify-center transition-all cursor-pointer w-full ${
              dragging ? 'border-orange-500 bg-orange-50/20' : 'bg-white/70 hover:bg-white/95'
            }`}
            style={{
              height: '236px',
              borderRadius: '32px',
              gap: '12px',
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('material-upload-trigger')?.click()}
          >
            <input
              id="material-upload-trigger"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            {formData.uploadedFileName ? (
              <div className="flex flex-col items-center gap-2">
                <FileDown size={24} className="text-orange-650 animate-bounce" />
                <p className="text-xs font-bold text-[#303030] font-bricolage">{formData.uploadedFileName}</p>
                <p className="text-[10px] text-gray-400 font-bricolage">File selected and loaded.</p>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="mt-1 px-3 py-1 bg-red-50 hover:bg-red-150 text-red-650 text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-colors"
                >
                  <X size={10} /> Clear
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={24} className="text-gray-400" />
                <div className="flex flex-col gap-1 text-center w-full max-w-[682px]" style={{ height: '46px' }}>
                  <p className="text-sm font-bold text-[#303030] font-bricolage leading-[140%] tracking-tight">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-xs text-[#A9A9A9] font-normal font-bricolage leading-[140%] tracking-tight">
                    JPEG, PNG, PDF, upto 10MB
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-[#F6F6F6] hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all duration-300"
                  style={{
                    width: '127px',
                    height: '36px',
                    borderRadius: '48px', // border radius XXL
                    paddingTop: '8px',
                    paddingBottom: '8px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                  }}
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
          <p
            className="font-bricolage text-[16px] text-center text-[#30303099] font-medium leading-[140%] tracking-tight w-full"
            style={{ height: '22px' }}
          >
            Upload images of your preferred document/image
          </p>
        </div>

        {/* ── Due Date picker (width: 100%, height: 74) ── */}
        <div className="flex flex-col gap-1.5 w-full" style={{ height: '74px' }}>
          <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage">
            Due Date
          </label>
          <div
            className="flex items-center px-4 bg-white/70 border border-[#DADADA] focus-within:border-gray-400 transition-colors w-full"
            style={{
              height: '44px',
              borderRadius: '100px', // rounded pill
              paddingTop: '11px',
              paddingBottom: '11px',
            }}
          >
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormDueDate(e.target.value)}
              className="bg-transparent outline-none text-xs flex-1 text-[#303030] font-semibold font-bricolage w-full"
              required
            />
            <Calendar size={14} className="text-gray-400" />
          </div>
        </div>

        {/* ── Question Types list ── */}
        <div className="flex flex-col gap-3 w-full">
          <label className="text-[10px] font-extrabold text-gray-700 uppercase tracking-wider font-bricolage mb-1">
            Question Type & Grading Row
          </label>

          <div className="flex flex-col gap-3 w-full">
            {formData.questionRows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-4 w-full h-[44px]">
                {/* Select dropdown container (fluid flex, height: 44) */}
                <div
                  className="relative flex items-center px-4 border border-[#DADADA] bg-white flex-1"
                  style={{ height: '44px', borderRadius: '100px' }}
                >
                  <select
                    value={row.type}
                    onChange={(e) =>
                      updateQuestionRow(row.id, { type: e.target.value as QuestionCategory })
                    }
                    className="w-full bg-transparent outline-none text-xs text-[#303030] font-bricolage font-medium appearance-none pr-8 cursor-pointer"
                  >
                    {QUESTION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Delete cross */}
                <button
                  type="button"
                  disabled={formData.questionRows.length <= 1}
                  onClick={() => removeQuestionRow(row.id)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 flex-shrink-0"
                >
                  <X size={16} />
                </button>

                {/* Counter Group with +/- (No. of questions / Marks - space width: 275) */}
                <div className="flex items-center gap-4 flex-shrink-0 select-none">
                  {/* Number of Questions (width: 100, height: 44) */}
                  <div
                    className="flex items-center bg-white border border-[#DADADA] px-2 py-2 w-[100px] h-[44px] justify-between"
                    style={{ borderRadius: '100px' }}
                  >
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                      onClick={() =>
                        updateQuestionRow(row.id, { numQuestions: Math.max(1, row.numQuestions - 1) })
                      }
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-[#303030] min-w-4 text-center font-bricolage">{row.numQuestions}</span>
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                      onClick={() =>
                        updateQuestionRow(row.id, { numQuestions: row.numQuestions + 1 })
                      }
                    >
                      +
                    </button>
                  </div>

                  {/* Marks (width: 100, height: 44) */}
                  <div
                    className="flex items-center bg-white border border-[#DADADA] px-2 py-2 w-[100px] h-[44px] justify-between"
                    style={{ borderRadius: '100px' }}
                  >
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                      onClick={() =>
                        updateQuestionRow(row.id, { marks: Math.max(1, row.marks - 1) })
                      }
                    >
                      -
                    </button>
                    <span className="text-xs font-extrabold text-[#303030] min-w-4 text-center font-bricolage">{row.marks}</span>
                    <button
                      type="button"
                      className="w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold border hover:bg-gray-150 cursor-pointer select-none"
                      onClick={() =>
                        updateQuestionRow(row.id, { marks: row.marks + 1 })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addQuestionRow}
            className="mt-3 self-start flex items-center gap-2 text-xs font-bold text-[#303030] select-none hover:opacity-85"
          >
            <span className="w-6 h-6 rounded-full bg-[#181818] text-white flex items-center justify-center font-bold text-sm">+</span>
            Add Question Type
          </button>
        </div>

        {/* Dynamic Totals Banner (width: 150, height: 44) */}
        <div className="flex flex-col items-end text-xs text-gray-500 gap-1 w-full font-bricolage font-medium leading-[110%] pr-4 select-none">
          <div className="flex gap-2">
            <span>Total Questions :</span>
            <span className="font-extrabold text-[#303030]">{totalQuestions}</span>
          </div>
          <div className="flex gap-2">
            <span>Total Marks :</span>
            <span className="font-extrabold text-[#303030]">{totalMarks}</span>
          </div>
        </div>

        {/* ── Additional Info Box (width: 100%, height: 132) ── */}
        <div className="flex flex-col gap-2 w-full" style={{ height: '132px' }}>
          <label className="font-bricolage text-[16px] font-bold text-[#303030]">
            Additional Information (For better output)
          </label>
          <div className="relative w-full">
            <textarea
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="w-full bg-white/70 border border-gray-200 rounded-2xl p-4 text-xs outline-none text-[#303030] font-bricolage placeholder-gray-400 pr-12"
            />
            {/* Voice enabled button (width: 36, height: 36, rounded-full) */}
            <button
              type="button"
              className="absolute right-3 bottom-3 w-9 h-9 rounded-full bg-[#F0F0F0] border border-gray-200 shadow-[0px_21.82px_32.73px_0px_rgba(0,0,0,0.2),0px_10.91px_32.73px_0px_rgba(0,0,0,0.12)] flex items-center justify-center text-gray-500 hover:text-[#303030] hover:bg-gray-200 transition-all duration-200 select-none cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Bottom Stepper Buttons ── */}
      <div className="flex justify-between items-center w-full max-w-[1100px] mx-auto mt-6 select-none gap-4">
        <button
          type="button"
          onClick={() => setActivePage('assignments')}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 hover:bg-gray-50 text-[#303030] text-xs font-bold rounded-full bg-white transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          Previous
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="btn-create-assignment flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md hover:scale-105 select-none"
          style={{
            width: '208px',
            height: '46px',
            borderRadius: '48px',
            background: '#181818',
            border: '1.5px solid transparent',
            backgroundImage: 'linear-gradient(#181818, #181818), linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(102, 102, 102, 0) 100%)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
          }}
        >
          {loading ? (
            <span className="animate-pulse">Generating...</span>
          ) : (
            <>
              Next
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
