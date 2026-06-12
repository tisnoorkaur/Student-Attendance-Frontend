import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export an attendance report to a styled PDF file with color-coded cells.
 * @param {object} report - The report object containing date, stats, and records
 */
export function exportReportToPdf(report) {
  const doc = new jsPDF('p', 'mm', 'a4');

  // --- Document Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Indigo/Blue primary accent
  doc.text('SPRINGFIELD SCHOOLS', 14, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('Class Attendance Registry Portal', 14, 25);

  // --- Divider ---
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 28, 196, 28);

  // --- Metadata Block (Left Column) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('REPORT DETAILS', 14, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`Class Name: Class ${report.classSection || 'All'}`, 14, 44);
  doc.text(`Session Date: ${report.date}`, 14, 50);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 56);

  // --- Summary Metrics Block (Right Column) ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('ATTENDANCE SUMMARY', 120, 37);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Enrolled: ${report.totalStudents}`, 120, 44);
  doc.text(`Present: ${report.presentCount}`, 120, 50);
  doc.text(`Absent: ${report.absentCount}`, 120, 56);
  doc.text(`Attendance Rate: ${report.percentage != null ? report.percentage.toFixed(1) : 0}%`, 120, 62);

  // --- Divider ---
  doc.line(14, 67, 196, 67);

  // --- Roster Table ---
  const tableBody = (report.records || []).map((record, index) => [
    index + 1,
    record.rollNumber || '-',
    record.studentName || record.name || '-',
    record.classSection || '-',
    record.status ? record.status.toUpperCase() : '-',
  ]);

  autoTable(doc, {
    startY: 72,
    head: [['#', 'Roll Number', 'Student Name', 'Class / Section', 'Marking Status']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 10,
      cellPadding: 4,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      textColor: [51, 65, 85], // Slate-700
      lineColor: [241, 245, 249], // Slate-100
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { fontStyle: 'bold', cellWidth: 32 },
      2: { cellWidth: 65 },
      3: { halign: 'center', cellWidth: 40 },
      4: { halign: 'center', cellWidth: 32 },
    },
    didParseCell(data) {
      if (data.section === 'body') {
        const record = report.records?.[data.row.index];
        if (record) {
          const status = record.status?.toLowerCase();
          
          if (status === 'present') {
            // Light green-50 background for present row cells
            data.cell.styles.fillColor = [240, 253, 244];
            
            // Highlight text in the status column
            if (data.column.index === 4) {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
              data.cell.styles.fontStyle = 'bold';
            }
          } else if (status === 'absent') {
            // Light red-50 background for absent row cells
            data.cell.styles.fillColor = [254, 242, 242];
            
            // Highlight text in the status column
            if (data.column.index === 4) {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    },
  });

  // --- Footer Page Numbers ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      `Generated on Springfield ERP | Page ${i} of ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`attendance-report-${report.classSection || 'All'}-${report.date}.pdf`);
}
