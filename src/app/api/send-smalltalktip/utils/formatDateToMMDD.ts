/**
 * Format a JavaScript Date object to a string in the 'MM-DD' format.
 *
 * This function takes a Date object and returns a string representing the month and day
 * in the format 'MM-DD'. Both the month and day are zero-padded to ensure two-digit
 * representation.
 *
 * @param {Date} date - The Date object to format. It should be a valid Date instance.
 * @returns {string} The formatted date string in 'MM-DD' format.
 *
 * @example
 * const date = new Date('2024-09-13');
 * const formattedDate = formatDateToMMDD(date);
 * console.log(formattedDate); // Outputs: '09-13'
 */
export function formatDateToMMDD(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}
