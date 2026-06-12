import { apiFetch } from './api';

export function sortStudentsByRoll(students) {
  return students.sort((a, b) =>
    (a.rollNumber || '').localeCompare(b.rollNumber || '', undefined, { numeric: true, sensitivity: 'base' })
  );
}

export async function getAllStudents() {
  const students = await apiFetch('/api/students');
  return sortStudentsByRoll(students);
}

export async function getStudentById(id) {
  return apiFetch(`/api/students/${id}`);
}

export async function addStudent(data) {
  return apiFetch('/api/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id, updates) {
  return apiFetch(`/api/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteStudent(id) {
  return apiFetch(`/api/students/${id}`, {
    method: 'DELETE',
  });
}

export async function getStudentsPaginated({ page = 1, pageSize = 10, classFilter = 'All', searchQuery = '' }) {
  // Since the backend doesn't currently support robust pagination for these parameters, 
  // we fetch all and paginate locally for now (simulating what Dexie did).
  let students = await apiFetch('/api/students');

  if (classFilter !== 'All') {
    students = students.filter((s) => s.classSection === classFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    students = students.filter(
      (s) =>
        (s.name || '').toLowerCase().includes(q) ||
        (s.rollNumber || '').toLowerCase().includes(q)
    );
  }

  sortStudentsByRoll(students);

  const total = students.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const paginatedStudents = students.slice(start, start + pageSize);

  return {
    students: paginatedStudents,
    total,
    totalPages,
  };
}

export async function bulkImportStudents(studentList) {
  // For bulk import, we can add a new backend endpoint or perform sequential POSTs
  // Sequential POSTs are fine for now as it mirrors the offline loop without massive changes,
  // but let's try to do it safely.
  let successCount = 0;
  const errors = [];

  for (let i = 0; i < studentList.length; i++) {
    const student = studentList[i];
    try {
      // Create student. The backend handles class mapping if needed.
      // Wait, the backend doesn't automatically create classes via student create endpoint.
      // We must map it locally or assume classes exist.
      // To simplify, we will just POST the student. If classId is missing, 
      // the backend studentController looks up by classSection string! (from my earlier review of the backend)
      await apiFetch('/api/students', {
        method: 'POST',
        body: JSON.stringify({
          name: student.name,
          rollNumber: student.rollNumber,
          classSection: student.classSection
        })
      });
      successCount++;
    } catch (e) {
      errors.push(`Row ${i + 2}: ${e.message}`);
    }
  }

  return { successCount, errors };
}

export async function getStudentCount() {
  const students = await apiFetch('/api/students');
  return students.length;
}
