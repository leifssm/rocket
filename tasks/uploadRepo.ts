import { confirm, isCancel, log, text } from "@clack/prompts";
import { getFolders, isRepoRoot, resolve } from "../lib/helpers/files";
import { $ } from "bun";

const mainFolder = "~/dev/";

export const uploadRepo = async () => {
  const folders = await getFolders(mainFolder);

  let repoPath = await text({
    message: `Enter the path of the repository from ${mainFolder}`,
    placeholder: `from ${mainFolder}`,
    validate(value) {
      if (value.length === 0) return `Path is required`;
      if (!folders.includes(value)) return `Folder does not exist`;
    },
  });

  if (isCancel(repoPath)) {
    log.info("Cancelled");
    return;
  }

  repoPath = resolve(mainFolder + repoPath);

  if (!await isRepoRoot(repoPath)) {
    const init = await confirm({
      message: "Folder is not a repository, do you want to initialize it?",
      active: "Initialize",
      inactive: "Cancel",
    });
    if (isCancel(init) || !init) return;

    await $`git init ${repoPath}`.quiet();
    log.success("Repository initialized!");
  }

  log.success("Repository found!");

};
