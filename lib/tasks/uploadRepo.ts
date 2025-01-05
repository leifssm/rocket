import { confirm, isCancel, log, spinner, text } from "@clack/prompts";
import { getFolders, isRepoRoot, resolve } from "../helpers/files";
import { $ } from "bun";
import { createRepo, gitInit, isRepoEmpty } from "../helpers/git";
import { CancelError, task } from "../helpers/clack";
import { DEV_FOLDER, GITHUB_USER } from "../constants";
import { github } from "../fetchers/github";
import { isoToPretty } from "../helpers/time";
import { taskAddRemote, taskCreateRepo, taskPush, taskPushAll } from "./minor";
import { Navigation } from "../menu";

export const uploadRepo = async () => {
  const folders = await getFolders(DEV_FOLDER);

  const repoName = await text({
    message: `Enter the name of a folder in ${DEV_FOLDER}`,
    placeholder: `from ${DEV_FOLDER}`,
    validate(value) {
      if (value.length === 0) return `Name is required`;
      if (!folders.includes(value)) return `Folder does not exist`;
    },
  });

  if (isCancel(repoName)) throw new CancelError();

  const repoPath = resolve(DEV_FOLDER + repoName);

  if (!await isRepoRoot(repoPath)) {
    const init = await confirm({
      message: "Folder is not a repository, do you want to initialize it?",
      active: "Initialize",
      inactive: "Cancel",
    });
    if (isCancel(init) || !init) throw new CancelError();

    if (await gitInit(repoPath)) {
      log.success("Repository initialized!");
    } else {
      throw new Error("Failed to initialize repository");
    }
  } else {
    log.success("Repository folder found!");
  }

  const repos = await github.get("repos");

  const existingRepo = repos.find((repo) => repo.name === repoName);

  if (!existingRepo) {
    const isPublic = await confirm({
      message: "Make the repository public?",
      active: "Public",
      inactive: "Private",
      initialValue: true,
    });

    if (isCancel(isPublic)) throw new CancelError();

    await taskCreateRepo(repoName, isPublic);
    await taskAddRemote(repoPath, `git@github.com:${GITHUB_USER}/${repoName}.git`);
    await taskPush(repoPath)
    return Navigation.COMPLETE;
  }

  const date = isoToPretty(existingRepo.createdAt);
  const loading = spinner();
  loading.start(
    `An existing repo with the name of '${repoName}' (${date}) already exists, checking if it is empty`,
  );

  const isEmpty = await isRepoEmpty(repoName);
  if (!isEmpty) {
    loading.stop(`Repo '${repoName}' (${date}) is not empty`, 1);
    const setRemote = await confirm({
      message: "Do you want to set as remote?",
      inactive: "Cancel",
    });
    if (setRemote) {
      await taskAddRemote(repoPath, `git@github.com:${GITHUB_USER}/${repoName}.git`);
    }
    log.info("Stopped to not override remote");
    return Navigation.COMPLETE;
  }
  loading.stop(`Repo '${repoName}' (${date}) is empty`);
  const shouldContinue = await confirm({
    message: "Do you want to set as remote and push?",
    inactive: "Cancel",
  });
  if (isCancel(shouldContinue) || !shouldContinue) throw new CancelError();

  await taskAddRemote(repoPath, `git@github.com:${GITHUB_USER}/${repoName}.git`);

  const commitText = await text({
    message: "Enter commit message",
    placeholder: "initial commit",
    initialValue: "initial commit",
    validate(value) {
      if (value.length === 0) return `Message is required`;
    },
  });
  if (isCancel(commitText)) throw new CancelError("Commit cancelled");

  await taskPushAll(repoPath, commitText);

  return Navigation.COMPLETE
};
