import { apiFetch } from './api';

export async function generateReport(date, classSection = 'All') {
  return apiFetch('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ date, classSection }),
  });
}

export async function getReportByDateAndClass(date, classSection = 'All') {
  // Backend doesn't support fetching by both natively on one route easily except if we fetch all or use query params.
  // The current backend route is `GET /api/reports/:date` which ignores classSection.
  // Actually, we can fetch all reports and filter.
  const reports = await apiFetch('/api/reports');
  return reports.find(r => r.date === date && r.classSection === classSection);
}

export async function getAllReports() {
  const reports = await apiFetch('/api/reports');
  return reports.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
}

export async function deleteReport(id) {
  return apiFetch(`/api/reports/${id}`, {
    method: 'DELETE',
  });
}
