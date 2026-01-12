export function insertDynamicYears(text: string): string {
  const today = new Date();
  const currYear = today.getFullYear();
  const nextYear = currYear + 1;
  return text
    .replace("$thisYear", currYear.toString())
    .replace("$nextYear", nextYear.toString());
}
