/**
 * Replaces all occurrences of year placeholders in the format '$YYYY' in a given string
 * with the number of years that have passed since that year, based on the provided year.
 *
 * @param {string} text - The input string containing year placeholders in the format '$YYYY'.
 * @param {number} refYear - The year to be used as the reference point for calculating the difference in years.
 * @returns {string} A new string where each '$YYYY' is replaced with the difference in years
 *                   from the provided year to the year from the placeholder.
 *
 * @example
 *  replaceYearPlaceholdersWithNumYears("Die Met wird heute $1966 Jahre alt", 2024);
 *  // Returns "Die Met wird heute 58 Jahre alt"
 *
 * @example
 *  replaceYearPlaceholdersWithNumYears("Vor $1974 Jahren war das Jahr 1974.", 2024);
 *  // Returns "Vor 50 Jahren war das Jahr 1974."
 */
export function replaceYearPlaceholdersWithNumYears(
  text: string,
  refYear: number
): string {
  if (!text) return "";
  const regex = /\$([0-9]{4})/g;
  return text.replace(regex, (_, yearStr) => {
    const year = parseInt(yearStr);
    const numYears = refYear - year;
    return numYears.toString();
  });
}
