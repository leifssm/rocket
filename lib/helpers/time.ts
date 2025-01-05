export const prettifyDate = (date: string | Date): string => {
  if (date instanceof Date) return prettifyDate(date.toISOString());
  return date.slice(0, 10).split("-").reverse().join(".");
};
