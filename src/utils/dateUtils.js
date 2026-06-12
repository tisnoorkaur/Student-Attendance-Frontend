/**
 * Format a date string or Date object to 'June 11, 2026' format.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date string or Date object to 'Jun 11' format.
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get today's date as a 'YYYY-MM-DD' string.
 * @returns {string}
 */
export function getTodayString() {
  return getDateString(new Date());
}

/**
 * Convert a Date object to 'YYYY-MM-DD' string.
 * @param {Date} date
 * @returns {string}
 */
export function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the 'YYYY-MM-DD' string for n days ago.
 * @param {number} n
 * @returns {string}
 */
export function getDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return getDateString(d);
}

/**
 * Get the day name (e.g., 'Monday') for a date string.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {string}
 */
export function getDayName(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Check if a date string represents today.
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return dateStr === getTodayString();
}

/**
 * Get an array of the last 7 date strings (today inclusive), oldest first.
 * @returns {string[]}
 */
export function getWeekDates() {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
}

/**
 * Get an array of the last 30 date strings (today inclusive), oldest first.
 * @returns {string[]}
 */
export function getMonthDates() {
  const dates = [];
  for (let i = 29; i >= 0; i--) {
    dates.push(getDaysAgo(i));
  }
  return dates;
}
