import { $ } from "bun"

export const mainFolder = "~/dev/"; 

export const isRepoEmpty = async (name: string) => {
  try {
    const out = await $`gh repo view ${name} --json isEmpty`.quiet();
    return !!out.json().isEmpty;
  } catch (e) {
    return false;
  }
}

export const createRepo = async (name: string, publicRepo = true) => {
  if (!name) throw new Error('Name is required');

  const flag = publicRepo ? '--public' : '--private';
  const { exitCode } = await $`gh repo create ${name} ${flag}`
    .nothrow()
    .quiet();

  if (exitCode !== 0) throw new Error(`Failed to create repository '${name}'`);  
}

export const cloneRepo = async (repo: string) => {
  await $`gh repo clone ${repo} ${mainFolder}${repo}`.quiet();
}

export const gitInit = async (path: string) => {
  try {
    await $`git init ${path}`.quiet();
    return true;
  } catch {
    return false;
  }
}
