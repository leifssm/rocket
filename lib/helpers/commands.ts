import { $ } from "bun";
import { DEV_FOLDER } from "../constants";

export const openVSCode = async (path: string) => {
  await $`code ${DEV_FOLDER}${path}`.quiet();
}
