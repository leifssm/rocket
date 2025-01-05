import {
  cancel,
  intro,
  outro,
} from "@clack/prompts";
import { type MenuOption, runMenu } from "./lib/menu";
import { createProject } from "./lib/tasks/createProject";
import { uploadRepo } from "./lib/tasks/uploadRepo";
import { DEV_FOLDER, GITHUB_USER } from "./lib/constants";
import { parseError } from "./lib/helpers/errors";
import { openRepo } from "./lib/tasks/openRepo";

if (!GITHUB_USER) throw "Please define your github account in lib/constants.ts";
if (!DEV_FOLDER) throw "Please define your dev folder in lib/constants.ts";

intro(`✶ Rocket 🚀 ✶`);

const menu: MenuOption = {
  label: "Select an option",
  options: [
    {
      label: "Open repo",
      hint: "Opens an existing repo in VS Code",
      task: openRepo
    },
    {
      label: "Create repo",
      hint: "Create a new repository",
      task: createProject,
    },
    {
      label: "Upload repo",
      hint: "Uploads an existing repository",
      task: uploadRepo,
    },
  ],
};

try {
  await runMenu(menu);
  outro(`Blastoff!`);
} catch (e) {
  cancel(parseError(e));
}
