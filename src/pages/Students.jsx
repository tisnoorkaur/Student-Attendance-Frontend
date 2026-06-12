import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Search,
  Filter,
  Users,
  Loader2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import StudentCard from '@/components/StudentCard';
import StudentForm from '@/components/StudentForm';
import BulkImportModal from '@/components/BulkImportModal';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import useStudentStore from '@/store/useStudentStore';
import useClassStore from '@/store/useClassStore';

import toast from 'react-hot-toast';

export default function Students() {
  const {
    students,
    total,
    totalPages,
    currentPage,
    pageSize,
    classFilter,
    searchQuery,
    isLoading,
    fetchStudents,
    setPage,
    setPageSize,
    setClassFilter,
    setSearchQuery,
    addStudent,
    updateStudent,
    deleteStudent,
    bulkImport,
  } = useStudentStore();

  const { classes, fetchClasses } = useClassStore();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsFormOpen(false);
    const isEditing = Boolean(formData.id);

    try {
      if (isEditing) {
        await updateStudent(formData.id, formData);
        toast.success('Student updated successfully');
      } else {
        await addStudent(formData);
        toast.success('Student enrolled successfully');
      }

    } catch (err) {
      toast.error(err.message || 'Failed to save student details');
    }
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    if (!selectedStudent) return;

    try {
      await deleteStudent(selectedStudent.id);
      toast.success('Student registry profile deleted');

    } catch (err) {
      toast.error('Failed to delete student');
    } finally {
      setSelectedStudent(null);
    }
  };

  const handleBulkImportComplete = async (studentsList) => {
    try {
      const result = await bulkImport(studentsList);

      return result;
    } catch (err) {
      throw err;
    }
  };

  // Helper values for pagination display
  const startIdx = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(total, currentPage * pageSize);

  return (
    <PageWrapper className="space-y-6">
      {/* Header and Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Student Registry ({total})
          </h1>
          <p className="text-sm dark:text-gray-400 text-gray-500 mt-0.5">
            Manage your classroom rosters, view profiles, or bulk enroll students.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold dark:bg-white/10 dark:hover:bg-white/15 bg-gray-105 hover:bg-gray-200 dark:text-white text-gray-700 transition-all border dark:border-white/5 border-gray-250 active:scale-95"
          >
            <FileSpreadsheet className="w-4.5 h-4.5" />
            Bulk Import CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="btn-primary flex items-center justify-center gap-2 text-sm py-2 px-4 font-semibold active:scale-95"
          >
            <UserPlus className="w-4.5 h-4.5" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl glass-light dark:glass border dark:border-white/10 border-gray-100">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/5 border-gray-200 flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm focus:outline-none border-none p-0 dark:text-white text-gray-800 placeholder-gray-400 w-full"
          />
        </div>

        {/* Class Filter */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/5 border-gray-200 min-w-[200px]">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-transparent text-sm font-semibold dark:text-white text-gray-800 focus:outline-none border-none p-0 cursor-pointer w-full"
          >
            <option value="All" className="dark:bg-slate-900 dark:text-white text-gray-850">All Classes</option>
            {classes.map((c) => {
              const label = `${c.name}-${c.section}`;
              return (
                <option key={c.id} value={label} className="dark:bg-slate-900 dark:text-white text-gray-800">
                  Class {label}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Student List Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm dark:text-gray-400 text-gray-500">Loading student profiles...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="card p-16 text-center border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white shadow-md">
          <EmptyState
            title={total === 0 ? "No Enrolled Students" : "No Matching Results"}
            description={
              total === 0
                ? "There are currently no students registered in the database. Click Enrol or Import CSV to register."
                : "No students matched your search criteria. Try modifying your filter dropdown or search text."
            }
            icon={Users}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Pagination bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/5 border-gray-150">
            <span className="text-xs dark:text-gray-400 text-gray-500">
              Showing <strong>{startIdx}</strong> to <strong>{endIdx}</strong> of <strong>{total}</strong> students
            </span>

            <div className="flex items-center gap-4">
              {/* Page Size select */}
              <div className="flex items-center gap-2">
                <span className="text-xs dark:text-gray-400 text-gray-500">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-transparent text-xs font-semibold dark:text-white text-gray-805 focus:outline-none border border-gray-300 dark:border-white/10 rounded-lg p-1 px-1.5 cursor-pointer"
                >
                  <option value="10" className="dark:bg-slate-900">10</option>
                  <option value="25" className="dark:bg-slate-900">25</option>
                  <option value="50" className="dark:bg-slate-900">50</option>
                  <option value="100" className="dark:bg-slate-900">100</option>
                </select>
              </div>

              {/* Prev/Next keys */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 dark:border-white/10 dark:text-white text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                
                <span className="text-xs font-bold dark:text-white text-gray-800">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 dark:border-white/10 dark:text-white text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedStudent ? 'Edit Student Profile' : 'Enroll New Student'}
        size="md"
      >
        <StudentForm
          student={selectedStudent}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        title="Bulk Import Students CSV"
        size="lg"
      >
        <BulkImportModal
          onImportComplete={handleBulkImportComplete}
          onCancel={() => setIsImportOpen(false)}
        />
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        title="Delete Student?"
        message={`Are you sure you want to delete "${selectedStudent?.name}"? This action will permanently remove this student and all their associated daily attendance records.`}
        confirmText="Delete Student"
        variant="danger"
      />
    </PageWrapper>
  );
}
