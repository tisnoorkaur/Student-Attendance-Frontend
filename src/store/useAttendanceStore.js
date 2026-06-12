import { create } from 'zustand';
import * as attendanceService from '@/services/attendanceService';
import * as studentService from '@/services/studentService';
import { sortStudentsByRoll } from '@/services/studentService';

const useAttendanceStore = create((set, get) => ({
  date: '',
  classSection: 'All',
  activeQueue: [], // Unmarked students
  markedList: [],  // Marked students: Array<{ student: object, status: string }>
  undoStack: [],   // Stack of actions: Array<{ type: 'single'|'bulk'|'toggle', data: any }>
  stats: {
    total: 0,
    present: 0,
    absent: 0,
    unmarked: 0,
    percentage: 0,
  },
  isLoading: false,
  isSaving: false,

  // Helper to re-compute statistics
  _computeStats: () => {
    const { activeQueue, markedList } = get();
    const total = activeQueue.length + markedList.length;
    const present = markedList.filter((m) => m.status === 'present').length;
    const absent = markedList.filter((m) => m.status === 'absent').length;
    const unmarked = activeQueue.length;
    const markedCount = markedList.length;
    const percentage = markedCount > 0 ? (present / markedCount) * 100 : 0;

    set({
      stats: {
        total,
        present,
        absent,
        unmarked,
        percentage,
      },
    });
  },

  initializeSession: async (date, classSection) => {
    set({ isLoading: true, date, classSection, undoStack: [] });
    try {
      // 1. Fetch all students
      const allStudents = await studentService.getAllStudents();
      const filteredStudents = classSection === 'All'
        ? allStudents
        : allStudents.filter((s) => s.classSection === classSection);

      // 2. Fetch attendance for this date
      const attendanceRecords = await attendanceService.getAttendanceByDate(date);
      const attendanceMap = new Map(attendanceRecords.map((r) => [r.studentId, r.status]));

      // 3. Separate into unmarked queue and marked list
      const activeQueue = [];
      const markedList = [];

      for (const student of filteredStudents) {
        const status = attendanceMap.get(student.id);
        if (status) {
          markedList.push({ student, status });
        } else {
          activeQueue.push(student);
        }
      }

      // Sort queue roll-number wise
      sortStudentsByRoll(activeQueue);
      // Sort marked list roll-number wise
      markedList.sort((a, b) =>
        (a.student.rollNumber || '').localeCompare(b.student.rollNumber || '', undefined, { numeric: true, sensitivity: 'base' })
      );

      set({ activeQueue, markedList, isLoading: false });
      get()._computeStats();
    } catch (err) {
      set({ isLoading: false });
      console.error('Failed to initialize attendance session:', err);
    }
  },

  markStudent: (studentId, status) => {
    const { activeQueue, markedList, undoStack } = get();
    const studentIndex = activeQueue.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) return;

    const student = activeQueue[studentIndex];

    // Remove from queue
    const nextQueue = [...activeQueue];
    nextQueue.splice(studentIndex, 1);

    // Add to marked list
    const nextMarked = [...markedList, { student, status }];
    nextMarked.sort((a, b) =>
      (a.student.rollNumber || '').localeCompare(b.student.rollNumber || '', undefined, { numeric: true, sensitivity: 'base' })
    );

    // Push to undo stack
    const action = {
      type: 'single',
      data: { student, status },
    };

    set({
      activeQueue: nextQueue,
      markedList: nextMarked,
      undoStack: [...undoStack, action],
    });

    get()._computeStats();
  },

  undoLastAction: () => {
    const { undoStack, activeQueue, markedList } = get();
    if (undoStack.length === 0) return;

    const nextStack = [...undoStack];
    const lastAction = nextStack.pop();

    if (lastAction.type === 'single') {
      const { student } = lastAction.data;

      // Remove from marked list
      const nextMarked = markedList.filter((m) => m.student.id !== student.id);

      // Return to queue
      const nextQueue = [...activeQueue, student];
      sortStudentsByRoll(nextQueue);

      set({
        activeQueue: nextQueue,
        markedList: nextMarked,
        undoStack: nextStack,
      });
    } else if (lastAction.type === 'bulk') {
      const { revertedStudents } = lastAction.data;
      const revertedIds = new Set(revertedStudents.map((s) => s.id));

      // Remove reverted students from marked
      const nextMarked = markedList.filter((m) => !revertedIds.has(m.student.id));

      // Add back to queue
      const nextQueue = [...activeQueue, ...revertedStudents];
      sortStudentsByRoll(nextQueue);

      set({
        activeQueue: nextQueue,
        markedList: nextMarked,
        undoStack: nextStack,
      });
    } else if (lastAction.type === 'toggle') {
      const { studentId, oldStatus } = lastAction.data;

      const nextMarked = markedList.map((m) => {
        if (m.student.id === studentId) {
          return { ...m, status: oldStatus };
        }
        return m;
      });

      set({
        markedList: nextMarked,
        undoStack: nextStack,
      });
    }

    get()._computeStats();
  },

  markAll: (status) => {
    const { activeQueue, markedList, undoStack } = get();
    if (activeQueue.length === 0) return;

    const newlyMarked = activeQueue.map((student) => ({ student, status }));
    const nextMarked = [...markedList, ...newlyMarked];
    nextMarked.sort((a, b) =>
      (a.student.rollNumber || '').localeCompare(b.student.rollNumber || '', undefined, { numeric: true, sensitivity: 'base' })
    );

    const action = {
      type: 'bulk',
      data: { revertedStudents: [...activeQueue] },
    };

    set({
      activeQueue: [],
      markedList: nextMarked,
      undoStack: [...undoStack, action],
    });

    get()._computeStats();
  },

  updateMarking: (studentId, newStatus) => {
    const { markedList, undoStack } = get();
    const index = markedList.findIndex((m) => m.student.id === studentId);
    if (index === -1) return;

    const oldStatus = markedList[index].status;
    if (oldStatus === newStatus) return;

    const nextMarked = [...markedList];
    nextMarked[index] = { ...nextMarked[index], status: newStatus };

    const action = {
      type: 'toggle',
      data: { studentId, oldStatus, newStatus },
    };

    set({
      markedList: nextMarked,
      undoStack: [...undoStack, action],
    });

    get()._computeStats();
  },

  unmarkStudent: (studentId) => {
    const { markedList, activeQueue } = get();
    const index = markedList.findIndex((m) => m.student.id === studentId);
    if (index === -1) return;

    const { student } = markedList[index];
    const nextMarked = markedList.filter((m) => m.student.id !== studentId);

    const nextQueue = [...activeQueue, student];
    sortStudentsByRoll(nextQueue);

    set({
      activeQueue: nextQueue,
      markedList: nextMarked,
    });

    get()._computeStats();
  },

  saveSession: async () => {
    const { date, markedList, classSection } = get();
    set({ isSaving: true });
    try {
      // Create list of { studentId, date, status } to commit
      const recordsToCommit = markedList.map((m) => ({
        studentId: m.student.id,
        date: date,
        status: m.status,
      }));

      if (recordsToCommit.length > 0) {
        await attendanceService.bulkMarkAttendance(date, recordsToCommit);
      }

      set({ isSaving: false });
      return true;
    } catch (err) {
      set({ isSaving: false });
      console.error('Failed to save attendance markings:', err);
      throw err;
    }
  },
}));

export default useAttendanceStore;
