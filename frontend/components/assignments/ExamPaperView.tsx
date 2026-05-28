'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import { jsPDF } from 'jspdf';

// ── Custom SVG PDF Icon with a green Plus badge ──
const PdfIconWithPlus = () => (
  <svg
    width="17.2"
    height="19.2"
    viewBox="0 0 18 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    {/* Page outline */}
    <path
      d="M2 1.5C2 0.671573 2.67157 0 3.5 0H11L16 5V18.5C16 19.3284 15.3284 20 14.5 20H3.5C2.67157 20 2 19.3284 2 18.5V1.5Z"
      fill="#303030"
    />
    {/* PDF text label */}
    <text
      x="9"
      y="11"
      fontSize="6"
      fontWeight="900"
      fontFamily="Inter, sans-serif"
      fill="#FFFFFF"
      textAnchor="middle"
    >
      PDF
    </text>
    {/* Small '+' badge */}
    <circle cx="13" cy="14" r="4.5" fill="#4BC26D" />
    <path
      d="M13 12V16M11 14H15"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export default function ExamPaperView() {
  const examPaper = useAppStore((s) => s.examPaper);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!examPaper) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[50vh]">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm bg-gray-100/80"
        >
          <span className="text-[#1E1E1E] font-extrabold text-2xl">📝</span>
        </div>
        <h2 className="text-lg font-bold font-bricolage text-[#303030]">
          No Exam Paper Selected
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mt-1 mb-6 font-bricolage">
          Please select an assignment from the list or create one to generate an exam paper.
        </p>
        <button
          onClick={() => setActivePage('assignments')}
          className="btn-create-assignment px-6 py-2.5 text-white font-bold bg-[#181818] rounded-full transition-all duration-200"
        >
          Go to Assignments
        </button>
      </div>
    );
  }

  // ── Dynamic jsPDF compiler function ──
  const handleDownloadPDF = () => {
    try {
      setIsDownloading(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let y = 20;
      const marginX = 20;
      const pageWidth = 210;
      const printWidth = pageWidth - 2 * marginX; // 170mm printable area

      // Setup standard page styles
      doc.setFont('helvetica', 'normal');

      // 1. School Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const schoolTitleLines = doc.splitTextToSize(examPaper.schoolName.toUpperCase(), printWidth);
      schoolTitleLines.forEach((line: string) => {
        doc.text(line, pageWidth / 2, y, { align: 'center' });
        y += 8;
      });

      // 2. Subject & Class Subtitles
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(`Subject: ${examPaper.subject}  |  Class: ${examPaper.className}`, pageWidth / 2, y, { align: 'center' });
      y += 8;

      // 3. Double Border lines
      doc.setLineWidth(0.8);
      doc.setDrawColor(48, 48, 48);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 1.5;
      doc.setLineWidth(0.3);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 8;

      // 4. Time Allowed & Max Marks Row
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Time Allowed: ${examPaper.timeAllowed}`, marginX, y);
      doc.text(`Maximum Marks: ${examPaper.maxMarks}`, pageWidth - marginX, y, { align: 'right' });
      y += 8;

      // Compulsory Instructions label
      doc.setFont('helvetica', 'bold');
      doc.text(examPaper.generalInstruction, marginX, y);
      y += 10;

      // 5. Student Details blanks
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Name: ________________________________________', marginX, y);
      y += 8;
      doc.text('Roll Number: __________________________________', marginX, y);
      y += 8;
      doc.text(`Class: ${examPaper.className} Section: ___________________________`, marginX, y);
      y += 10;

      // Separation dashed line
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(marginX, y, pageWidth - marginX, y);
      doc.setLineDashPattern([], 0); // reset
      y += 10;

      // 6. Section & Questions
      examPaper.sections.forEach((section) => {
        // Prevent bottom overflow before writing section titles
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(section.title.toUpperCase(), pageWidth / 2, y, { align: 'center' });
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(section.subtitle, marginX, y);
        y += 6;

        if (section.instruction) {
          doc.setFont('helvetica', 'bold');
          doc.text(section.instruction, marginX, y);
          y += 8;
        }

        // Print list of questions
        section.questions.forEach((q) => {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);

          const qLabel = `${q.number}. [${q.difficulty}] ${q.text}`;
          const marksLabel = `[${q.marks} Mark${q.marks > 1 ? 's' : ''}]`;

          // Split question text inside page boundaries
          const maxQWidth = printWidth - 25; // leave space for right aligned marks
          const lines = doc.splitTextToSize(qLabel, maxQWidth);
          const blockHeight = lines.length * 7 + 4;

          if (y + blockHeight > 275) {
            doc.addPage();
            y = 20;
          }

          // Render question text
          doc.text(lines, marginX, y);

          // Render marks aligned to the right-margin
          doc.setFont('helvetica', 'bold');
          doc.text(marksLabel, pageWidth - marginX, y, { align: 'right' });
          doc.setFont('helvetica', 'normal');

          y += blockHeight;
        });
      });

      // End of Question Paper label
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('End of Question Paper', pageWidth / 2, y, { align: 'center' });
      y += 12;

      // 7. Answer Key Page (Force new page for teacher answer book key!)
      doc.addPage();
      y = 20;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('ANSWER KEY', pageWidth / 2, y, { align: 'center' });
      y += 10;

      doc.setLineWidth(0.5);
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 8;

      examPaper.answerKey.forEach((entry) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${entry.number}. `, marginX, y);

        doc.setFont('helvetica', 'normal');
        const ansLines = doc.splitTextToSize(entry.answer, printWidth - 12);
        const ansHeight = ansLines.length * 6 + 6;

        if (y + ansHeight > 275) {
          doc.addPage();
          y = 20;
        }

        doc.text(ansLines, marginX + 8, y);
        y += ansHeight;
      });

      // Trigger standard local file download
      const safeTitle = examPaper.subject.toLowerCase().replace(/[^a-z0-9]/g, '-');
      doc.save(`${safeTitle}-grade-${examPaper.className}-assessment.pdf`);
    } catch (err) {
      console.error('Error generating PDF document:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto animate-fade-in pb-16 flex flex-col gap-6 select-none">
      {/* ── Page Header Back Link ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActivePage('assignments')}
          className="p-2 rounded-xl border border-gray-250 bg-white text-gray-500 hover:text-gray-800 transition-all hover:scale-105 shadow-sm"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold font-bricolage tracking-tight text-[#111111]">
            Assessment Result
          </h1>
          <p className="text-xs text-gray-400 font-bricolage">
            View the compiled exam paper below or download it directly as a high-fidelity PDF sheet.
          </p>
        </div>
      </div>

      {/* ── 1. Top Dialogue Download PDF Banner (1060px w, 164px h) ── */}
      <div
        className="w-full max-w-[1060px] bg-[#181818CC] backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          minHeight: '164px',
          borderRadius: '32px',
          padding: '24px 32px',
        }}
      >
        {/* Banner Text description in Bricolage */}
        <p
          className="font-bricolage font-bold text-[20px] leading-[140%] tracking-[-0.04em] text-white flex-1 select-text"
          style={{ verticalAlign: 'middle' }}
        >
          Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
        </p>

        {/* Download PDF button */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center justify-center bg-white rounded-full transition-all duration-200 hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] shrink-0 border border-white/20 shadow-md font-bricolage select-none"
          style={{
            width: '200px',
            height: '44px',
            gap: '16px',
            paddingRight: '24px',
            paddingLeft: '24px',
          }}
        >
          {isDownloading ? (
            <div className="w-5 h-5 border-2 border-[#303030] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span
                className="font-medium text-[16px] leading-[22px] tracking-[-0.04em] text-[#303030]"
                style={{ verticalAlign: 'middle' }}
              >
                Download as PDF
              </span>
              <PdfIconWithPlus />
            </>
          )}
        </button>
      </div>

      {/* ── 2. Assignment Dialogue main container (1100px width) ── */}
      <div
        className="w-full max-w-[1100px] bg-[#5E5E5E] flex flex-col gap-3 shadow-2xl"
        style={{
          borderRadius: '32px',
          padding: '20px',
        }}
      >
        {/* Skeuomorphic Pure White Exam Paper Sheet */}
        <div
          className="w-full bg-white select-text shadow-inner flex flex-col gap-8 px-4 py-8 md:px-12 md:py-9"
          style={{
            borderRadius: '24px',
          }}
        >
          {/* Header school details */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h2
              className="font-inter font-bold text-2xl md:text-[32px] leading-[160%] tracking-[-0.04em] text-[#303030] w-full max-w-[996px]"
              style={{ verticalAlign: 'middle' }}
            >
              {examPaper.schoolName}
            </h2>
            <p
              className="font-inter font-semibold text-lg md:text-[24px] leading-[160%] tracking-[-0.04em] text-[#303030] w-full max-w-[996px]"
              style={{ verticalAlign: 'middle' }}
            >
              Subject: {examPaper.subject}  |  Class: {examPaper.className}
            </p>
          </div>

          {/* Time and Maximum Marks row */}
          <div
            className="w-full max-w-[996px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 border-double border-[#303030]/30 pb-3 gap-2"
          >
            <span
              className="font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030]"
              style={{ verticalAlign: 'middle' }}
            >
              Time Allowed: {examPaper.timeAllowed}
            </span>
            <span
              className="font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030]"
              style={{ verticalAlign: 'middle' }}
            >
              Maximum Marks: {examPaper.maxMarks}
            </span>
          </div>

          {/* General instructions */}
          <div
            className="w-full max-w-[996px] mx-auto text-left"
          >
            <span
              className="font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030]"
              style={{ verticalAlign: 'middle' }}
            >
              {examPaper.generalInstruction}
            </span>
          </div>

          {/* Student fill-in blank rows */}
          <div
            className="w-full max-w-[996px] mx-auto flex flex-col gap-3 pb-6 border-b border-[#303030]/20 border-dashed"
          >
            <div
              className="w-full flex items-center font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030]"
            >
              <span>Name: ______________________</span>
            </div>
            <div
              className="w-full flex items-center font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030]"
            >
              <span>Roll Number: ________________</span>
            </div>
            <div
              className="w-full flex items-center font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030]"
            >
              <span>Class: {examPaper.className} Section: __________</span>
            </div>
          </div>

          {/* Sections & Questions list */}
          {examPaper.sections.map((section, sIdx) => (
            <div key={section.id || sIdx} className="w-full max-w-[996px] mx-auto flex flex-col gap-6">
              {/* Section Header */}
              <div className="flex flex-col gap-2 items-center text-center">
                <h3
                  className="font-inter font-semibold text-xl md:text-[24px] leading-[160%] tracking-[-0.04em] text-[#303030] w-full"
                  style={{ verticalAlign: 'middle' }}
                >
                  {section.title}
                </h3>
                <div
                  className="flex flex-col gap-1 font-inter font-semibold text-sm md:text-[18px] leading-[160%] tracking-[-0.04em] text-[#303030] w-full text-left"
                >
                  <p style={{ verticalAlign: 'middle' }}>{section.subtitle}</p>
                  {section.instruction && (
                    <p style={{ verticalAlign: 'middle' }}>{section.instruction}</p>
                  )}
                </div>
              </div>

              {/* Questions Stack */}
              <div className="w-full flex flex-col gap-4">
                {section.questions.map((question, qIdx) => (
                  <div
                    key={qIdx}
                    className="w-full flex items-start justify-between gap-4 font-inter font-normal text-sm md:text-[16px] leading-[2.4] tracking-[-0.04em] text-[#303030]"
                  >
                    <p className="flex-1" style={{ verticalAlign: 'middle' }}>
                      {question.number}. [{question.difficulty}] {question.text}
                    </p>
                    <span
                      className="font-bold whitespace-nowrap shrink-0"
                      style={{ verticalAlign: 'middle' }}
                    >
                      [{question.marks} Marks]
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* End of Question Paper notice */}
          <div className="w-full max-w-[996px] mx-auto text-center py-4 border-b border-gray-100">
            <span
              className="font-inter font-bold text-sm md:text-[16px] leading-[2.4] tracking-[-0.04em] text-[#303030]"
              style={{ verticalAlign: 'middle' }}
            >
              End of Question Paper
            </span>
          </div>

          {/* Answer Key Block */}
          {examPaper.answerKey && examPaper.answerKey.length > 0 && (
            <div className="w-full max-w-[996px] mx-auto flex flex-col gap-6 mt-6">
              <h4
                className="font-inter font-bold text-sm md:text-[16px] leading-[2.4] tracking-[-0.04em] text-[#303030] border-t border-[#303030]/20 pt-6"
                style={{ verticalAlign: 'middle' }}
              >
                Answer Key:
              </h4>

              <div className="flex flex-col gap-4">
                {examPaper.answerKey.map((entry, aIdx) => (
                  <div
                    key={aIdx}
                    className="w-full flex items-start gap-2 font-inter font-normal text-sm md:text-[16px] leading-[2.4] tracking-[-0.04em] text-[#303030]"
                  >
                    <span className="font-bold shrink-0">{entry.number}.</span>
                    <p className="flex-1" style={{ verticalAlign: 'middle' }}>
                      {entry.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
