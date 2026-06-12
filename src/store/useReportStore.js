import { create } from 'zustand';
import * as reportService from '@/services/reportService';

const useReportStore = create((set, get) => ({
  reports: [],
  selectedReport: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const list = await reportService.getAllReports();
      set({ reports: list, isLoading: false });

      // Keep selected report synchronized if it exists in the new list, or default select the first
      const { selectedReport } = get();
      if (selectedReport) {
        const updatedSelected = list.find((r) => r.id === selectedReport.id);
        set({ selectedReport: updatedSelected || null });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectReport: (report) => {
    set({ selectedReport: report });
  },

  generateReport: async (date, classSection) => {
    set({ isGenerating: true, error: null });
    try {
      const report = await reportService.generateReport(date, classSection);
      await get().fetchReports();
      set({ selectedReport: report, isGenerating: false });
      return report;
    } catch (err) {
      set({ error: err.message, isGenerating: false });
      throw err;
    }
  },

  deleteReport: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await reportService.deleteReport(id);
      
      const { selectedReport } = get();
      if (selectedReport && selectedReport.id === id) {
        set({ selectedReport: null });
      }

      await get().fetchReports();
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));

export default useReportStore;
