import { apiFetch } from './api';

export async function getAllClasses() {
  return apiFetch('/api/classes');
}

export async function getClassById(id) {
  return apiFetch(`/api/classes/${id}`);
}

export async function addClass(data) {
  return apiFetch('/api/classes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClass(id, updates) {
  return apiFetch(`/api/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteClass(id) {
  return apiFetch(`/api/classes/${id}`, {
    method: 'DELETE',
  });
}
