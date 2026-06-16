import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
  Loader2,
  Save
} from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import useClassStore from '@/store/useClassStore';
import useAuthStore from '@/store/useAuthStore';
import { getAllStudents } from '@/services/studentService';

import toast from 'react-hot-toast';

export default function Classes() {
  const { classes, isLoading, fetchClasses, addClass, updateClass, deleteClass } = useClassStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Roster enrollment counts per class section mapping
  const [studentCounts, setStudentCounts] = useState({});
  const [form, setForm] = useState({ name: '', section: '' });
  const [editingId, setEditingId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
    loadStudentCounts();
  }, []);

  const loadStudentCounts = async () => {
    try {
      const allStudents = await getAllStudents();
      const counts = {};
      allStudents.forEach((student) => {
        const key = student.classId || 0;
        counts[key] = (counts[key] || 0) + 1;
      });
      setStudentCounts(counts);
    } catch (err) {
      console.error('Failed to compute class roster sizes', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.section.trim()) {
      toast.error('Both class name and section are required');
      return;
    }

    try {
      if (editingId) {
        await updateClass(editingId, {
          name: form.name.trim(),
          section: form.section.trim(),
        });
        toast.success('Class updated successfully');
      } else {
        await addClass({
          name: form.name.trim(),
          section: form.section.trim(),
        });
        toast.success('Class created successfully');
      }
      setForm({ name: '', section: '' });
      setEditingId(null);
      loadStudentCounts();

    } catch (err) {
      toast.error(err.message || 'Failed to save class details');
    }
  };

  const handleEdit = (cls) => {
    setEditingId(cls.id);
    setForm({ name: cls.name, section: cls.section });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ name: '', section: '' });
  };

  const handleOpenDelete = (cls) => {
    setSelectedClass(cls);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteOpen(false);
    if (!selectedClass) return;

    try {
      await deleteClass(selectedClass.id);
      toast.success('Class and all associated rosters deleted');
      loadStudentCounts();

    } catch (err) {
      toast.error('Failed to delete class');
    } finally {
      setSelectedClass(null);
    }
  };

  return (
    <PageWrapper className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Form Card (Admin Only) */}
      {isAdmin && (
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 border border-gray-150 dark:border-white/5 dark:bg-white/5 bg-white space-y-5 shadow-lg">
            <h2 className="font-extrabold text-lg dark:text-white text-gray-900 flex items-center gap-2 pb-2 border-b dark:border-white/5 border-gray-100">
              {editingId ? <Edit2 className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-indigo-500" />}
              {editingId ? 'Edit Class Details' : '+ Add New Class'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
                  Class Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. 10, 11, 12"
                  className="input-field text-sm"
                  required
                />
                <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-1">Enter the grade or class number</p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
                  Section Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
                  placeholder="e.g. A, B, C"
                  className="input-field text-sm"
                  required
                />
                <p className="text-[10px] dark:text-gray-500 text-gray-400 mt-1">Enter the section letter or name</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-ghost dark:text-gray-300 text-gray-600 flex-1 py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-primary flex items-center justify-center gap-2 flex-1 py-2 text-sm font-semibold"
                >
                  {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Save Changes' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Right Column: Classes List Panel */}
      <div className={isAdmin ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-xl dark:text-white text-gray-900 flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-indigo-500" />
            Your Classes ({classes.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm dark:text-gray-400 text-gray-500">Retrieving class lists...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="card p-16 text-center border dark:border-white/5 border-gray-100 dark:bg-white/5 bg-white shadow-md">
            <EmptyState
              title={isAdmin ? "No Classes Created Yet" : "No Classes Assigned"}
              description={isAdmin ? "You need to create at least one class before adding students. Use the form on the left to create your first class (e.g. Class 10-A)." : "There are no classes assigned to your school. Please contact the administrator to assign classes."}
              icon={GraduationCap}
            />
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AnimatePresence>
              {classes.map((cls) => {
                const count = studentCounts[cls.id] || 0;
                return (
                  <motion.div
                    layout
                    key={cls.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="card p-5 border border-gray-100 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="px-3 py-1.5 rounded-xl dark:bg-indigo-500/10 bg-indigo-50 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm border dark:border-indigo-500/10 border-indigo-100">
                          Class {cls.name}-{cls.section}
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(cls)}
                              className="p-2 rounded-xl dark:hover:bg-white/10 hover:bg-gray-100 text-gray-400 hover:text-indigo-500 transition-colors"
                              title="Edit class details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(cls)}
                              className="p-2 rounded-xl dark:hover:bg-white/10 hover:bg-gray-100 text-gray-400 hover:text-rose-500 transition-colors"
                              title="Delete class section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-xs dark:text-gray-400 text-gray-500">
                        <p className="flex items-center gap-2 font-medium">
                          <Users className="w-4.5 h-4.5 text-gray-400" />
                          <span>{count} Student(s) Enrolled</span>
                        </p>
                        <p className="flex items-center gap-2 font-medium">
                          <Calendar className="w-4.5 h-4.5 text-gray-400" />
                          <span>Created: {new Date(cls.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteOpen(false)}
        title="Remove This Class?"
        message={`Are you sure you want to remove Class "${selectedClass?.name}-${selectedClass?.section}"? This will delete all students in this class and their attendance records. This cannot be undone.`}
        confirmText="Yes, Remove Class"
        variant="danger"
      />
    </PageWrapper>
  );
}
