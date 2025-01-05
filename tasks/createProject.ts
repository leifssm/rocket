import { $ } from "bun";
import { readdir } from "node:fs/promises";
import { confirm, isCancel, log, text } from "@clack/prompts";
import { github } from "../github";
import { fileExists } from "../lib/helpers/files";
import { task } from "../lib/helpers/clack";
import { cloneRepo } from "../lib/helpers/git";
import { openVSCode } from "../lib/helpers/commands";
import { createRepo } from "../lib/helpers/git";
import { initializeRepo } from "./initializeRepo";

export const createProject = async (repoName?: string) => {
  let repo = repoName;

  if (!repo) {
    const repos = await github.get("repos");

    const name = await text({
      message: "Enter the name of the repository",
      validate(value) {
        if (value.length === 0) return `Name is required`;
        if (/[^a-z\-]/.test(value)) {
          return `Repo name can only contain lowercase letters and hyphens`;
        }
        if (!/^[a-z].*[a-z]$/.test(value)) {
          return `Repo name must start and end with letters`;
        }
        if (repos.find((r) => r.name === value)) return `Repo already exists`;
      },
    });

    if (isCancel(name)) throw "Cancelled";

    repo = name;
  }

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
    () => createRepo(repo, publicRepo),
  );

  await task("Cloning repository", "Repository cloned", () => cloneRepo(repo));

  // const initialize = await confirm({
  //   message: "Do you want to initialize the repo?",
  // });

  // if (isCancel(initialize) || !initialize) {
  // } else {
  //   await initializeRepo(repo);
  // }

  await task(
    "Opening repository",
    "Repository opened",
    () => openVSCode(repo),
  );
  
};
