import { spinner } from '@clack/prompts';
import { withContext } from './strings';

export class CancelError extends Error {
  constructor (reason?: string) {
    super(withContext('Cancelled', reason))
  }
}

const loader = spinner();
export type Spinner = ReturnType<typeof spinner>;

export const task = async <T>(
  loadingTitle: string,
  finishedTitle: string,
  fn: (spinner: Spinner) => Promise<T>
): Promise<T> => {
  loader.start(loadingTitle);
  try {
    const result = await fn(loader);
    loader.stop(finishedTitle);
    return result;
  } catch (e) {
    loader.stop(`Failed in task: ${loadingTitle}`, 1)
    throw e;
  }
};
