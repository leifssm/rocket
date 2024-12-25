import { $ } from 'bun';
import { readdir } from 'node:fs/promises';
import { isCancel, log, text, confirm, cancel } from '@clack/prompts';
import { github } from '../github';
import { fileExists } from '../lib/helpers/files';
import { task } from '../lib/helpers/clack';

export const createRepo = async () => {
  const repos = await task(
    'Fetching repositories',
    'Fetched repositories',
    () => github.get('repos')
  );

  const repo = await text({
    message: 'Enter the name of the repository',
    validate(value) {
      if (value.length === 0) return `Name is required`;
      if (/[^a-z\-]/.test(value))
        return `Repo name can only contain lowercase letters and hyphens`;
      if (!/^[a-z].*[a-z]$/.test(value))
        return `Repo name must start and end with letters`;
      if (repos.find((r) => r.name === value)) return `Repo already exists`;
    },
  });

  if (isCancel(repo)) {
    log.info('Cancelled');
    return;
  }

  const alreadyExists = await fileExists(`~/dev/${repo}`);
  if (alreadyExists) {
    log.error(`Repository ${repo} already exists, manually delete it first`);
    return;
  }

  const publicRepo = await confirm({
    message: 'Make the repository public?',
    active: 'Public',
    inactive: 'Private',
    initialValue: true,
  });
  
  await task('Creating repository', 'Repository created', async () => {
    const flag = publicRepo ? '--public' : '--private';
    const { exitCode } = await $`gh repo create ${repo} ${flag}`
      .nothrow()
      .quiet();

    if (exitCode !== 0) cancel(`Failed to create repository ${repo}`);
  });

  await task('Cloning repository', 'Repository cloned', async () => {
    await $`gh repo clone ${repo} ~/dev/${repo}`.quiet();
  })
  
  await task('Opening repository', 'Repository opened', async () => {
    await $`code ~/dev/${repo}`.quiet();
  })
};
