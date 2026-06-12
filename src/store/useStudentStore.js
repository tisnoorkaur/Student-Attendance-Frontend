import { create } from 'zustand';
import * as studentService from '@/services/studentService';

const useStudentStore = create((set, get) => ({
  students: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
  classFilter: 'All',
  searchQuery: '',
  isLoading: false,
  error: null,

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchStudents();
  },

  setPageSize: (size) => {
    set({ pageSize: size, currentPage: 1 });
    get().fetchStudents();
  },

  setClassFilter: (filter) => {
    set({ classFilter: filter, currentPage: 1 });
    get().fetchStudents();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query, currentPage: 1 });
    get().fetchStudents();
  },

  fetchStudents: async () => {
    const { currentPage, pageSize, classFilter, searchQuery } = get();
    set({ isLoading: true, error: null });
    try {
      const result = await studentService.getStudentsPaginated({
        page: currentPage,
        pageSize,
        classFilter,
        searchQuery,
      });
      set({
        students: result.students,
        total: result.total,
        totalPages: result.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addStudent: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.addStudent(data);
      await get().fetchStudents();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateStudent: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.updateStudent(id, updates);
      await get().fetchStudents();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteStudent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.deleteStudent(id);
      // If the current page becomes empty and we're on a page > 1, go back one page
      const { currentPage, students } = get();
      const nextPage = students.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      set({ currentPage: nextPage });
      await get().fetchStudents();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  bulkImport: async (studentList) => {
    set({ isLoading: true, error: null });
    try {
      const result = await studentService.bulkImportStudents(studentList);
      await get().fetchStudents();
      return result;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));

export default useStudentStore;
