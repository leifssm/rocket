export const withContext = (title: string, context?: string) => {
  if (!context) return title;
  return `${title}: ${context}`;
}