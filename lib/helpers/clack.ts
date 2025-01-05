import { spinner } from '@clack/prompts';

const loader = spinner();

export const task = async <T>(
  loadingTitle: string,
  finishedTitle: string,
  fn: () => Promise<T>
): Promise<T> => {
  loader.start(loadingTitle);
  try {
    const result = await fn();
    loader.stop(finishedTitle);
    return result;
  } catch (e) {
    loader.stop(`Failed in task: ${loadingTitle}`, 1)
    throw e;
  }
};
