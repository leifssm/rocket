import { readdir } from 'node:fs/promises';

export const resolve = (path: string) => path.replace(/^~/, 'C:/Users/leif');

export const fileExists = async (path: string) => {
  try {
    await readdir(resolve(path));
    return true;
  } catch {
    return false;
  }
};

export const isRepoRoot = async (path: string) => {
  return await fileExists(`${path}/.git`);
}

export const getFolders = async (path: string) => {
  return await readdir(resolve(path));
}
