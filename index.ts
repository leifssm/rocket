import {
  cancel,
  confirm,
  group,
  groupMultiselect,
  intro,
  isCancel,
  log,
  multiselect,
  note,
  outro,
  password,
  select,
  selectKey,
  spinner,
  tasks,
  text,
  updateSettings,
} from "@clack/prompts";
import { type MenuOption, runMenu } from "./lib/menu";
import { createProject } from "./tasks/createProject";
import { uploadRepo } from "./tasks/uploadRepo";
import { DEV_FOLDER, GITHUB_USER } from "./lib/constants";
import { github } from "./github";
import { sleep } from "bun";
import { isRepoEmpty } from "./lib/helpers/git";
import { parseError } from "./lib/helpers/errors";

if (!GITHUB_USER) throw "Please define your github account in lib/constants.ts" 
if (!DEV_FOLDER) throw "Please define your dev folder in lib/constants.ts" 

intro(`✶ Rocket 🚀 ✶`);

const menu: MenuOption = {
  label: "Select an option",
  options: [
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
