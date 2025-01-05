import { log } from "@clack/prompts";
import { ShellError } from "bun";

// Workaround as bun does not expose ShellError
export const isShellError = (error: unknown): error is ShellError => error?.constructor?.name === "ShellError";

export const parseError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (isShellError(error)) {
    return error.stderr.toString("utf-8")
  }
  log.warn(`Unknown error type ${error}`);
  return error + "";
}