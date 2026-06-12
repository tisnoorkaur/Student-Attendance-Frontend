import { useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard shortcuts.
 * Shortcuts only fire when no input, textarea, or contentEditable element is focused.
 *
 * @param {Object.<string, Function>} shortcuts - Map of key (case-insensitive) to handler function
 *
 * @example
 * useKeyboardShortcut({
 *   'p': () => markPresent(),
 *   'a': () => markAbsent(),
 * });
 */
export function useKeyboardShortcut(shortcuts) {
  const handleKeyDown = useCallback(
    (event) => {
      // Ignore if an input, textarea, or contentEditable element is focused
      const target = event.target;
      const tagName = target.tagName.toLowerCase();
      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target.isContentEditable
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const handler = shortcuts[key];

      if (handler && typeof handler === 'function') {
        handler(event);
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export default useKeyboardShortcut;
