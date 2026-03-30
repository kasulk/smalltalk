export function insertDynamicYears(text: string): string {
  const today = new Date();
  const currYear = today.getFullYear();
  const nextYear = currYear + 1;
  return text
    .replaceAll("$thisYear", currYear.toString())
    .replaceAll("$nextYear", nextYear.toString());
}
