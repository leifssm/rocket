import { confirm, isCancel, text } from "@clack/prompts";
import { github } from "../fetchers/github";
import { CancelError } from "../helpers/clack";
import { Navigation } from "../menu";
import { taskCloneRepo, taskCreateRepo, taskOpenVSCode } from "./minor";

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

    if (isCancel(name)) return Navigation.BACK;

    repo = name;
  }

  const isPublic = await confirm({
    message: "Make the repository public?",
    active: "Public",
    inactive: "Private",
    initialValue: true,
  });

  if (isCancel(isPublic)) throw new CancelError();

  await taskCreateRepo(repo, isPublic);

  await taskCloneRepo(repo)

  // const initialize = await confirm({
  //   message: "Do you want to initialize the repo?",
  // });

  // if (isCancel(initialize) || !initialize) {
  // } else {
  //   await initializeRepo(repo);
  // }

  await taskOpenVSCode(repo);

  return Navigation.COMPLETE
};
