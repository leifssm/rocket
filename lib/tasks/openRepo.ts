import { isCancel, select } from "@clack/prompts";
import { DEV_FOLDER } from "../constants";
import { getSubfolders } from "../helpers/files";
import { prettifyDate } from "../helpers/time";
import { Navigation } from "../menu";
import { taskOpenVSCode } from "./minor";

export const openRepo = async () => {
  const folders = await getSubfolders(DEV_FOLDER);
  folders.sort((a, b) => b.changed.getTime() - a.changed.getTime());

  const repoName = await select({
    message: `Select a folder from ${DEV_FOLDER}`,
    maxItems: 10,
    options: folders.map((folder) => ({
      value: folder.name,
      hint: prettifyDate(folder.changed),
    })),
  });

  if (isCancel(repoName)) return Navigation.BACK;

  await taskOpenVSCode(repoName);

  return Navigation.COMPLETE;
};
