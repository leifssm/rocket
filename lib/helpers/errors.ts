import { log } from "@clack/prompts";
import { ShellError } from "bun";
import { withContext } from "./strings";

// Workaround as bun does not expose ShellError
export const isShellError = (value: unknown): value is ShellError =>
  value?.constructor?.name === "ShellError";

export const isError = (value: unknown): value is Error =>
  value instanceof Error;

export const parseError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (isError(error)) {
    return withContext(error.name, error.message);
  }
  if (isShellError(error)) {
    return error.stderr.toString("utf-8");
  }
  log.warn(`Unknown error type ${error}`);
  return error + "";
};
