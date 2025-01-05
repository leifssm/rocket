import { $ } from "bun";
import { Cache } from "../cache";
import { log } from "@clack/prompts";
import { task } from "../helpers/clack";
import { taskFetchRepos } from "../tasks/minor";

export interface Repo {
  name: string;
  description: string;
  createdAt: string;
  isPrivate: boolean;
}

export const github = new Cache()
  .store('repos', async () => {
    const response = await taskFetchRepos();
    return response.json() as Repo[];
  });

export const repoExists = async (name: string) => {
  const repos = await github.get('repos');
  return repos.some(repo => repo.name === name);
}
