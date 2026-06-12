const AVATAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#14b8a6',
  '#f97316',
  '#06b6d4',
];

/**
 * Get the initials from a name (first letter of first and last name).
 * @param {string} name
 * @returns {string} e.g., 'John Doe' -> 'JD'
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get a deterministic avatar color based on the name.
 * Uses a simple hash to pick from a vibrant color palette.
 * @param {string} name
 * @returns {string} Hex color string
 */
export function getAvatarColor(name) {
  if (!name || typeof name !== 'string') return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
