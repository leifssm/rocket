import { $ } from "bun";
import { task } from "../helpers/clack";
import { cloneRepo, createRepo } from "../helpers/git";
import { openVSCode } from "../helpers/commands";

export const taskCloneRepo = async (repoName: string) => (
  await task(
    "Cloning repository",
    "Repository cloned",
    () => cloneRepo(repoName),
  )
);

export const taskCreateRepo = async (repoName: string, isPublic: boolean) => (
  await task(
    "Creating repository",
    "Repository created",
    () => createRepo(repoName, isPublic),
  )
);

export const taskAddRemote = async (repoPath: string, remote: string) => (
  await task(
    "Adding remote",
    "Remote added",
    () =>
      $`
        git -C ${repoPath} remote add origin ${remote}
        git branch -M main
      `.quiet(),
  )
);

export const taskPush = async (repoPath: string) => (
  await task(
    "Pushing to remote",
    "Successfully pushed to remote",
    () => $`git -C ${repoPath} push -u origin main`.quiet(),
  )
);

export const taskPushAll = async (repoPath: string, commitText: string) => (
  await task(
    "Pushing to remote",
    "Successfully pushed to remote",
    () =>
      $`
        git -C ${repoPath} add --all
        git -C ${repoPath} commit -m "${commitText}"
        git -C ${repoPath} push -u origin main
      `.quiet(),
  )
)

export const taskOpenVSCode = async (repoPath: string) => (
  await task(
    "Opening repository",
    "Repository opened",
    () => openVSCode(repoPath),
  )
);

export const taskFetchRepos = async () => (
  await task(
    "Fetching repositories",
    "Fetched repositories",
    () =>
      $`gh repo list --json name --json description --json createdAt --json isPrivate`
        .quiet(),
  )
);
