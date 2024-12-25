import { spinner } from '@clack/prompts';

export const task = async <T>(
  loadingTitle: string,
  finishedTitle: string,
  fn: () => Promise<T>
): Promise<T> => {
  const loader = spinner();
  loader.start(loadingTitle);
  const result = await fn();
  loader.stop(finishedTitle);
  return result;
};
