import { getRandomNumFromNums } from "./getRandomNumFromNums";

/**
 * Returns the day of the month from a given Date object.
 *
 * This function checks if the current day of the month is the 31st.
 * If the day is 31, it selects a random number from 0 and 31, using
 * the `getRandomNumFromNums` function. Otherwise, it simply returns
 * the current day of the month.
 *
 * @param {Date} date - The Date object from which to extract the day of the month.
 * @returns {number} The day of the month, or a random number if the day is 31.
 *
 * @example
 * const date = new Date('2024-09-31');
 * const dayNum = getDayNumFromDate(date);
 * console.log(dayNum); // Outputs `0` or `31`
 * @example
 * const date = new Date('2024-09-27');
 * const dayNum = getDayNumFromDate(date);
 * console.log(dayNum); // Outputs `27`
 */
export function getDayNumFromDate(date: Date): number {
  const isToday31 = date.getDate() === 31;
  const dayNum = isToday31 ? getRandomNumFromNums(0, 31) : date.getDate();
  return dayNum;
}
