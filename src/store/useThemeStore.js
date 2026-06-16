import { create } from 'zustand';

/**
 * Read the initial theme preference from localStorage.
 * Defaults to true (dark mode) if no preference is stored.
 */
function getInitialTheme() {
  try {
    const stored = localStorage.getItem('theme-dark');
    if (stored !== null) {
      return stored === 'true';
    }
  } catch {
    // localStorage may be unavailable
  }
  return false; // default to light mode
}

const useThemeStore = create((set) => ({
  isDark: getInitialTheme(),

  toggleTheme: () =>
    set((state) => {
      const newValue = !state.isDark;
      try {
        localStorage.setItem('theme-dark', String(newValue));
      } catch {
        // localStorage may be unavailable
      }
      return { isDark: newValue };
    }),
}));

export default useThemeStore;
