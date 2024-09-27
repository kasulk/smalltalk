/**
 * Calculates the estimated reading time for a given text based on an average reading speed.
 *
 * @param {string} text - The text to be read.
 * @param {number} [AVERAGE_WORDS_PER_MINUTE=200] - The average number of words that can be read per minute. Default is 200.
 * @returns {number} - The estimated reading time in minutes, rounded up to the nearest whole number.
 */
export function getReadingTime(
  text: string,
  AVERAGE_WORDS_PER_MINUTE: number = 200,
): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / AVERAGE_WORDS_PER_MINUTE);
}
