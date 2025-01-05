import { confirm, isCancel, log, select, spinner, text } from "@clack/prompts";
import { getSubfolders, isRepoRoot, resolve } from "../helpers/files";
import { gitInit, isRepoEmpty } from "../helpers/git";
import { CancelError } from "../helpers/clack";
import { DEV_FOLDER, GITHUB_USER } from "../constants";
import { github } from "../fetchers/github";
import { prettifyDate } from "../helpers/time";
import { taskAddRemote, taskCreateRepo, taskPush, taskPushAll } from "./minor";
import { Navigation } from "../menu";

export const uploadRepo = async () => {
  const folders = await getSubfolders(DEV_FOLDER);
  folders.sort((a, b) => b.changed.getTime() - a.changed.getTime());

  const repoName = await select({
    message: `Select a folder from ${DEV_FOLDER}`,
    options: folders.map((folder) => ({
      value: folder.name,
      hint: prettifyDate(folder.changed),
    })),
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
    github.invalidate("repos");
    await taskAddRemote(
      repoPath,
      `git@github.com:${GITHUB_USER}/${repoName}.git`,
    );
    await taskPush(repoPath);
    return Navigation.COMPLETE;
  }

  const date = prettifyDate(existingRepo.createdAt);
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
      await taskAddRemote(
        repoPath,
        `git@github.com:${GITHUB_USER}/${repoName}.git`,
      );
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

  await taskAddRemote(
    repoPath,
    `git@github.com:${GITHUB_USER}/${repoName}.git`,
  );

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

  return Navigation.COMPLETE;
};
