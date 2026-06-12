import { create } from 'zustand';
import * as classService from '@/services/classService';

const useClassStore = create((set, get) => ({
  classes: [],
  isLoading: false,
  error: null,

  fetchClasses: async () => {
    set({ isLoading: true, error: null });
    try {
      const classes = await classService.getAllClasses();
      set({ classes, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  addClass: async ({ name, section }) => {
    set({ isLoading: true, error: null });
    try {
      await classService.addClass({ name, section });
      await get().fetchClasses();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateClass: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await classService.updateClass(id, updates);
      await get().fetchClasses();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteClass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await classService.deleteClass(id);
      await get().fetchClasses();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));

export default useClassStore;
