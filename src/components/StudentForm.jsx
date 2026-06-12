import { useState, useEffect } from 'react';
import { UserPlus, Save, GraduationCap } from 'lucide-react';
import useClassStore from '@/store/useClassStore';
import { Link } from 'react-router-dom';

export default function StudentForm({ student = null, onSubmit, onCancel }) {
  const { classes, fetchClasses } = useClassStore();
  
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    classId: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || '',
        rollNumber: student.rollNumber || '',
        classId: student.classId ? student.classId.toString() : '',
      });
    }
  }, [student]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!form.classId) newErrors.classId = 'Class selection is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const selectedClass = classes.find((c) => c.id === Number(form.classId));
      if (!selectedClass) {
        toast.error('Invalid class selection');
        return;
      }

      onSubmit({
        ...student,
        name: form.name.trim(),
        rollNumber: form.rollNumber.trim(),
        classId: Number(form.classId),
        classSection: `${selectedClass.name}-${selectedClass.section}`,
      });
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isEditing = Boolean(student);

  if (classes.length === 0) {
    return (
      <div className="text-center py-6 space-y-4">
        <GraduationCap className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-bold text-base dark:text-white text-gray-800">No Classes Available</h3>
        <p className="text-xs dark:text-gray-400 text-gray-500 max-w-xs mx-auto">
          You must configure at least one class section before you can enroll students in the registry.
        </p>
        <div className="pt-2">
          <Link
            to="/classes"
            onClick={onCancel}
            className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4 font-semibold"
          >
            Create Class Section
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={handleChange('name')}
          placeholder="Enter student name"
          className={`input-field ${errors.name ? 'ring-2 ring-rose-500 border-rose-500' : ''}`}
        />
        {errors.name && (
          <p className="text-rose-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      {/* Roll Number */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
          Roll Number <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={form.rollNumber}
          onChange={handleChange('rollNumber')}
          placeholder="Enter roll number (e.g. 1, 10, A-15)"
          className={`input-field ${errors.rollNumber ? 'ring-2 ring-rose-500 border-rose-500' : ''}`}
        />
        {errors.rollNumber && (
          <p className="text-rose-500 text-xs mt-1">{errors.rollNumber}</p>
        )}
      </div>

      {/* Class Section Select */}
      <div>
        <label className="block text-sm font-semibold mb-1.5 dark:text-gray-300 text-gray-700">
          Class / Section <span className="text-rose-500">*</span>
        </label>
        <select
          value={form.classId}
          onChange={handleChange('classId')}
          className={`input-field bg-transparent select-field cursor-pointer ${errors.classId ? 'ring-2 ring-rose-500 border-rose-500' : ''}`}
        >
          <option value="" className="dark:bg-slate-900 dark:text-gray-400 text-gray-500">-- Select Class Section --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-white text-gray-800">
              Class {c.name}-{c.section}
            </option>
          ))}
        </select>
        {errors.classId && (
          <p className="text-rose-500 text-xs mt-1">{errors.classId}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost dark:text-gray-300 text-gray-600 flex-1">
          Cancel
        </button>
        <button type="submit" className="btn-primary flex items-center justify-center gap-2 flex-1 font-semibold">
          {isEditing ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          {isEditing ? 'Update Student' : 'Enroll Student'}
        </button>
      </div>
    </form>
  );
}
