import { $ } from "bun";
import { Cache } from "./lib/cache";
import { log } from "@clack/prompts";
import { task } from "./lib/helpers/clack";

export interface Repo {
  name: string;
  description: string;
  createdAt: string;
}

export const github = new Cache()
  .store('repos', async () => {
    const response = await task(
      "Fetching repositories",
      "Fetched repositories",
      () => $`gh repo list --json name --json description --json createdAt`.quiet(),
    );
    return response.json() as Repo[];
  });

export const repoExists = async (name: string) => {
  const repos = await github.get('repos');
  return repos.some(repo => repo.name === name);
}
