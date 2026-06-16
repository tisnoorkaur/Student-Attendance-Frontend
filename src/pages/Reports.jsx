import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  Plus,
  Trash2,
  ChevronRight,
  FileSpreadsheet,
  FileDown,
  Loader2,
  GraduationCap,
  Filter,
  Users
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import useReportStore from '@/store/useReportStore';
import useClassStore from '@/store/useClassStore';
import { exportReportToPdf } from '@/utils/exportPdf';
import { exportReportToCsv } from '@/utils/exportCsv';
import { getTodayString, formatDate } from '@/utils/dateUtils';

import toast from 'react-hot-toast';

export default function Reports() {
  const {
    reports,
    selectedReport,
    isLoading,
    isGenerating,
    fetchReports,
    selectReport,
    generateReport,
    deleteReport
  } = useReportStore();

  const { classes, fetchClasses } = useClassStore();

  const [generateDate, setGenerateDate] = useState(getTodayString());
  const [generateClass, setGenerateClass] = useState('All');
  const [filterClass, setFilterClass] = useState('All');

  // Deletion state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [reportToDeleteId, setReportToDeleteId] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchClasses();
  }, []);

  // Set default selection if none
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      selectReport(reports[0]);
    }
  }, [reports]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const report = await generateReport(generateDate, generateClass);
      toast.success(`Report compiled for date: ${generateDate} (${generateClass})`);

    } catch (err) {
      toast.error(err.message || 'Failed to generate report');
    }
  };

  const handleOpenDelete = (id, e) => {
    e.stopPropagation(); // Prevent select click bubble
    setReportToDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    if (!reportToDeleteId) return;

    try {
      await deleteReport(reportToDeleteId);
      toast.success('Report record permanently removed');

    } catch (err) {
      toast.error('Failed to delete report');
    } finally {
      setReportToDeleteId(null);
    }
  };

  const handleExportPdf = (report) => {
    if (!report) return;
    try {
      exportReportToPdf(report);
      toast.success('Exported to PDF successfully');
    } catch (err) {
      console.error('Failed to export PDF', err);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportCsv = (report) => {
    if (!report) return;
    try {
      exportReportToCsv(report);
      toast.success('Exported to CSV successfully');
    } catch (err) {
      console.error('Failed to export CSV', err);
      toast.error('Failed to export CSV');
    }
  };

  // Filter report list by Class
  const filteredReports = reports.filter(
    (r) => filterClass === 'All' || r.classSection === filterClass
  );

  return (
    <PageWrapper className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Generate Form & List */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Compilation form */}
        <div className="card p-5 border dark:border-white/5 border-gray-150 dark:bg-white/5 bg-white space-y-4 shadow-md">
          <h2 className="font-bold text-base dark:text-white text-gray-900 flex items-center gap-2 pb-1 border-b dark:border-white/5 border-gray-100">
            <Plus className="w-4.5 h-4.5 text-indigo-500" />
            Create New Report
          </h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 dark:text-gray-300 text-gray-650">
                Pick a Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={generateDate}
                  onChange={(e) => setGenerateDate(e.target.value)}
                  className="input-field pr-10 pl-4 py-2 text-sm cursor-pointer"
                  required
                />
                <Calendar className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 dark:text-gray-300 text-gray-650">
                Choose Class
              </label>
              <select
                value={generateClass}
                onChange={(e) => setGenerateClass(e.target.value)}
                className="input-field text-sm cursor-pointer select-field bg-transparent"
              >
                <option value="All" className="dark:bg-slate-900">All Classes (Global)</option>
                {classes.map((c) => {
                  const label = `${c.name}-${c.section}`;
                  return (
                    <option key={c.id} value={label} className="dark:bg-slate-900 dark:text-white">
                      Class {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 font-semibold"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isGenerating ? 'Creating...' : 'Create Report'}
            </button>
          </form>
        </div>

        {/* History log lists */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-base dark:text-white text-gray-900 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-indigo-500" />
              Past Reports
            </h2>
            
            {/* Filter class dropdown */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-gray-500 dark:text-slate-400 border-none p-0 focus:ring-0 cursor-pointer outline-none max-w-[120px]"
              >
                <option value="All" className="dark:bg-slate-900">All Classes</option>
                {classes.map((c) => {
                  const label = `${c.name}-${c.section}`;
                  return (
                    <option key={c.id} value={label} className="dark:bg-slate-900">
                      Class {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="card p-8 text-center border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white text-gray-500 text-xs shadow-sm">
              No reports found. Create your first report above!
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredReports.map((report) => {
                const isSelected = selectedReport && selectedReport.id === report.id;
                return (
                  <div
                    key={report.id}
                    onClick={() => selectReport(report)}
                    className={`card p-4 flex items-center justify-between border transition-all duration-250 cursor-pointer
                      ${
                        isSelected
                          ? 'dark:bg-indigo-500/10 dark:border-indigo-500/30 bg-indigo-50/50 border-indigo-200 shadow-md scale-[1.01]'
                          : 'dark:bg-white/5 dark:border-white/5 bg-white border-gray-100 hover:border-gray-300 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl flex-shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold dark:text-white text-gray-900 truncate">
                          {formatDate(report.date)}
                        </p>
                        <p className="text-[10px] dark:text-gray-400 text-gray-500 font-bold uppercase tracking-wide mt-0.5">
                          Class {report.classSection || 'All'} • {report.percentage.toFixed(0)}% Rate
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleOpenDelete(report.id, e)}
                        className="p-1.5 rounded-lg dark:hover:bg-white/10 hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Delete report log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? 'translate-x-0.5' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Detailed View */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedReport ? (
            <motion.div
              key={selectedReport.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="card p-6 border dark:border-white/5 border-gray-100 dark:bg-slate-900 bg-white space-y-6 shadow-xl"
            >
              {/* Header block details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-white/10 border-gray-100 pb-5">
                <div>
                  <h2 className="text-xl font-black dark:text-white text-gray-900">
                    Report details for {formatDate(selectedReport.date)}
                  </h2>
                  <p className="text-xs dark:text-gray-400 text-gray-500 mt-1.5 flex items-center gap-1 font-medium">
                    <GraduationCap className="w-3.5 h-3.5" />
                    Class: <span className="font-bold">{selectedReport.classSection || 'All'}</span>
                    <span className="mx-1.5">•</span>
                    Compiled: {new Date(selectedReport.generatedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportPdf(selectedReport)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-600/20 active:scale-95"
                  >
                    <FileDown className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleExportCsv(selectedReport)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold dark:bg-white/10 dark:hover:bg-white/15 bg-gray-100 hover:bg-gray-200 dark:text-white text-gray-700 transition-all active:scale-95 border dark:border-white/5 border-gray-250"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Download CSV
                  </button>
                </div>
              </div>

              {/* Stats counts cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl dark:bg-white/5 bg-gray-50 text-center border dark:border-white/5 border-gray-100">
                  <p className="text-[10px] dark:text-gray-400 text-gray-500 uppercase font-bold tracking-wider">Attendance Rate</p>
                  <p className="text-2xl font-black text-indigo-500 mt-1">{selectedReport.percentage.toFixed(1)}%</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-white/5 bg-gray-50 text-center border dark:border-white/5 border-gray-100">
                  <p className="text-[10px] dark:text-gray-400 text-gray-500 uppercase font-bold tracking-wider">Total Enrolled</p>
                  <p className="text-2xl font-black dark:text-white text-gray-900 mt-1">{selectedReport.totalStudents}</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-white/5 bg-gray-50 text-center border dark:border-white/5 border-gray-100">
                  <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Present Count</p>
                  <p className="text-2xl font-black text-emerald-500 mt-1">{selectedReport.presentCount}</p>
                </div>
                <div className="p-4 rounded-2xl dark:bg-white/5 bg-gray-50 text-center border dark:border-white/5 border-gray-100">
                  <p className="text-[10px] text-rose-500 uppercase font-bold tracking-wider">Absent Count</p>
                  <p className="text-2xl font-black text-rose-500 mt-1">{selectedReport.absentCount}</p>
                </div>
              </div>

              {/* Markings Table */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-sm dark:text-white text-gray-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Student List & Roster Status
                </h3>
                <div className="overflow-x-auto rounded-2xl border dark:border-white/5 border-gray-150">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="dark:bg-white/5 bg-gray-50 border-b dark:border-white/5 border-gray-150 font-bold text-xs dark:text-gray-400 text-gray-500">
                        <th className="p-3.5 pl-4 w-12 text-center">#</th>
                        <th className="p-3.5">Roll Number</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5 text-center">Class</th>
                        <th className="p-3.5 pr-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-white/5 divide-gray-100">
                      {selectedReport.records.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-gray-500 text-xs font-semibold">
                            No students registered for this class compilation
                          </td>
                        </tr>
                      ) : (
                        selectedReport.records.map((rec, index) => {
                          const isPresent = rec.status === 'present';
                          return (
                            <tr key={rec.studentId} className="dark:hover:bg-white/5 hover:bg-gray-55/40 transition-colors">
                              <td className="p-3.5 pl-4 text-center text-gray-400 text-xs font-semibold">{index + 1}</td>
                              <td className="p-3.5 font-mono text-xs dark:text-slate-350 text-slate-700">#{rec.rollNumber}</td>
                              <td className="p-3.5 font-bold dark:text-white text-gray-900">{rec.studentName || rec.name}</td>
                              <td className="p-3.5 text-center dark:text-slate-400 text-slate-500 font-semibold text-xs">{rec.classSection}</td>
                              <td className="p-3.5 pr-4 text-center">
                                <span className={isPresent ? 'badge-success' : 'badge-danger'}>
                                  {isPresent ? 'Present' : 'Absent'}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card p-16 text-center border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white h-full flex flex-col items-center justify-center min-h-[400px] shadow-lg">
              <EmptyState
                title="Select a Report to View"
                description="Click on any report from the list on the left, or create a new one using the form above."
                icon={FileText}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        title="Delete This Report?"
        message="Are you sure you want to delete this report? This only removes the report, not the actual attendance records."
        confirmText="Yes, Delete Report"
        variant="danger"
      />
    </PageWrapper>
  );
}
