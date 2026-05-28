import { jsPDF } from 'jspdf';
import { QuestionPaper } from '../store/assignmentStore';

/**
 * Programmatically compiles and exports a question paper into a printable physical PDF format.
 * Sets standard sizes (Header: 16pt, Subheaders: 12-13pt, Questions: 11pt) and handles line wrapping.
 */
export function exportQuestionPaper(questionPaper: QuestionPaper, assignmentTitle: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let y = 20;
  const marginX = 15;
  const pageWidth = 210;
  const printWidth = pageWidth - 2 * marginX; // 180mm printable width

  // ─── 1. School Header (Centered, bold 16pt) ───
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('VEDAAI GLOBAL SCHOOL', pageWidth / 2, y, { align: 'center' });
  y += 8;

  // ─── 2. Assessment Title (Centered, bold 13pt) ───
  doc.setFontSize(13);
  doc.text(assignmentTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 10;

  // ─── 3. Double Border Dividers ───
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 1.5;
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 8;

  // ─── 4. Assessment Metadata (Date, Subject, Total Marks) ───
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject: Physics', marginX, y);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2 - 20, y);
  doc.text('Total Marks: 50', pageWidth - marginX, y, { align: 'right' });
  y += 6;

  // Divider below Metadata
  doc.setLineWidth(0.2);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 10;

  // ─── 5. Student Fill-in Blanks ───
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Name: ______________________', marginX, y);
  doc.text('Roll Number: ______________', pageWidth / 2 - 25, y);
  doc.text('Section: ______________', pageWidth - marginX - 45, y);
  y += 12;

  // Dashed separator line representing the tear boundary
  doc.setLineDashPattern([1, 1], 0);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineDashPattern([], 0); // Reset dash style to solid
  y += 10;

  // ─── 6. Map Sections & Questions ───
  questionPaper.sections.forEach((section) => {
    // Check boundary limit before adding new sections
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Section title (underlined, bold 12pt)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(section.title.toUpperCase(), marginX, y);
    
    // Add custom underlines
    const titleWidth = doc.getTextWidth(section.title.toUpperCase());
    doc.line(marginX, y + 1, marginX + titleWidth, y + 1);
    y += 6;

    // Section instructions (italic 10pt)
    if (section.instruction) {
      doc.setFont('helvetica', 'oblique');
      doc.setFontSize(10);
      doc.text(section.instruction, marginX, y);
      y += 6;
    }

    y += 2; // Spacing before questions

    // Section Questions
    section.questions.forEach((question, qIdx) => {
      doc.setFontSize(11);
      
      const qNum = `Q.${qIdx + 1}. `;
      const qText = question.text;

      // Wrap question text dynamically inside margins
      const textOffset = 12; // indentation spacing from number
      const maxTextWidth = printWidth - textOffset - 20; // leaves space for marks right-aligned
      
      doc.setFont('helvetica', 'normal');
      const wrappedLines = doc.splitTextToSize(qText, maxTextWidth);

      // Estimate total height needed (each line is roughly 6mm + spacing)
      const estimatedHeight = wrappedLines.length * 6 + 4;

      // Handle multi-page overflows
      if (y + estimatedHeight > 275) {
        doc.addPage();
        y = 20;
      }

      // Print question number
      doc.setFont('helvetica', 'bold');
      doc.text(qNum, marginX, y);

      // Print wrapped question text blocks
      doc.setFont('helvetica', 'normal');
      doc.text(wrappedLines, marginX + textOffset, y);

      // Print points right-aligned
      const marksText = `[${question.marks} mark${question.marks > 1 ? 's' : ''}]`;
      doc.setFont('helvetica', 'bold');
      doc.text(marksText, pageWidth - marginX, y, { align: 'right' });

      y += estimatedHeight;
    });

    y += 6; // Section separator gap
  });

  // ─── 7. Compile & Trigger Document Download ───
  const safeTitle = assignmentTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${safeTitle}-question-paper.pdf`;
  doc.save(filename);
}
