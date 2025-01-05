import { readdir, stat } from "node:fs/promises";

export const resolve = (path: string) => (
  path
    .replace(/\/$/, "")
    .replace(/^~/, Bun.env.USERPROFILE!)
);

export const fileExists = async (path: string) => {
  try {
    await readdir(resolve(path));
    return true;
  } catch {
    return false;
  }
};

export type FolderData = { 
  name: string;
  accessed: Date;
  changed: Date;
  created: Date;
}
export const getSubfolderNames = async (path: string) => {
  const absolutePath = resolve(path);
  const files = await readdir(absolutePath, { withFileTypes: true });
  const dirs: string[] = [];

  for (const file of files) if (file.isDirectory()) dirs.push(file.name);

  return dirs;
}

export const getSubfolders = async (path: string) => {
  const absolutePath = resolve(path);
  const dirs = await getSubfolderNames(path);

  const folders = await Promise.all(
    dirs.map(async (folder) => {
      const stats = await stat(`${absolutePath}/${folder}`);
      return { 
        name: folder,
        accessed: stats.atime,
        changed: stats.ctime,
        created: stats.birthtime
      }
    })
  );

  return folders;
};

export const isRepoRoot = async (path: string) => {
  return await fileExists(`${path}/.git`);
};
