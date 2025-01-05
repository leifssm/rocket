import { $ } from "bun";
import { DEV_FOLDER } from "../constants";

export const openVSCode = async (repoName: string) => {
  await $`code ${DEV_FOLDER}${repoName}`.quiet();
}
