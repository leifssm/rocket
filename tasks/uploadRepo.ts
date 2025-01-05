import { confirm, isCancel, log, spinner, text } from "@clack/prompts";
import { getFolders, isRepoRoot, resolve } from "../lib/helpers/files";
import { $ } from "bun";
import {
  createRepo,
  gitInit,
  isRepoEmpty,
} from "../lib/helpers/git";
import { task } from "../lib/helpers/clack";
import { DEV_FOLDER, GITHUB_USER } from "../lib/constants";
import { github } from "../github";
import { isoToPretty } from "../lib/helpers/time";

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

  if (isCancel(repoName)) throw "Cancelled";

  const repoPath = resolve(DEV_FOLDER + repoName);

  if (!await isRepoRoot(repoPath)) {
    const init = await confirm({
      message: "Folder is not a repository, do you want to initialize it?",
      active: "Initialize",
      inactive: "Cancel",
    });
    if (isCancel(init) || !init) throw "Cancelled";

    if (await gitInit(repoPath)) {
      log.success("Repository initialized!");
    } else {
      throw "Failed to initialize repository";
    }
  } else {
    log.success("Repository folder found!");
  }

  const repos = await github.get("repos");

  const existingRepo = repos.find((repo) => repo.name === repoName);

  if (!existingRepo) {
    const publicRepo = await confirm({
      message: "Make the repository public?",
      active: "Public",
      inactive: "Private",
      initialValue: true,
    });

    if (isCancel(publicRepo)) throw "Cancelled";

    await task(
      "Creating repository",
      "Repository created",
      () => createRepo(repoName, publicRepo),
    );
    await task(
      "Adding remote",
      "Added remote",
      () =>
        $`
          git -C ${repoPath} remote add origin git@github.com:${GITHUB_USER}/${repoName}.git
          git branch -M main
        `
          .quiet(),
    );
    await task(
      "Pushing to remote",
      "Successfully pushed to remote",
      () => $`git -C ${repoPath} push -u origin main`.quiet(),
    );
    return;
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
      await $`
        git -C ${repoPath} remote add origin git@github.com:${GITHUB_USER}/${repoName}.git
        git branch -M main
      `.quiet();
      log.success("Remote added");
    }
    log.info("Stopped to not override remote");
    return;
  }
  loading.stop(`Repo '${repoName}' (${date}) is empty`);
  const shouldContinue = await confirm({
    message: "Do you want to set as remote and push?",
    inactive: "Cancel",
  });
  if (isCancel(shouldContinue) || !shouldContinue) throw "Cancelled";

  await task(
    "Adding remote",
    "Added remote",
    () =>
      $`
        git -C ${repoPath} remote add origin git@github.com:${GITHUB_USER}/${repoName}.git
        git branch -M main
      `
        .quiet(),
  );

  const commitText = await text({
    message: "Enter commit message",
    placeholder: "initial commit",
    initialValue: "initial commit",
    validate(value) {
      if (value.length === 0) return `Message is required`;
    },
  });
  if (isCancel(commitText)) throw "Commit cancelled";

  await task(
    "Pushing to remote",
    "Successfully pushed to remote",
    () =>
      $`
      git -C ${repoPath} add --all
      git -C ${repoPath} commit -m "${commitText}"
      git -C ${repoPath} push -u origin main
    `.quiet(),
  );
};
