import Papa from 'papaparse';

/**
 * Trigger a CSV file download in the browser with UTF-8 BOM.
 * @param {string} csvString - The CSV content string
 * @param {string} filename - The filename for the download
 */
function downloadCsv(csvString, filename) {
  // Prefixing with UTF-8 Byte Order Mark (BOM) ensures Excel identifies encoding
  const bom = '\ufeff';
  const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export a report object to a valid CSV file and trigger download.
 * Columns: Date, Class, Roll Number, Student Name, Status
 * @param {object} report - The report object containing date, classSection, and records
 */
export function exportReportToCsv(report) {
  const records = report.records || [];
  
  // Format data specifically for PapaParse unparse mapping
  const csvData = records.map((record) => ({
    'Date': report.date,
    'Class': record.classSection || report.classSection || 'All',
    'Roll Number': record.rollNumber || '-',
    'Student Name': record.studentName || record.name || '-',
    'Status': record.status ? record.status.toUpperCase() : '-',
  }));

  // Generate CSV using PapaParse
  const csvString = Papa.unparse(csvData, {
    quotes: true, // Wraps fields in quotes to preserve spacing/commas
    header: true,
  });

  const filename = `attendance-report-${report.classSection || 'All'}-${report.date}.csv`;
  downloadCsv(csvString, filename);
}
