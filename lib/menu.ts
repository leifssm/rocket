import { isCancel, select } from "@clack/prompts";
import type { PromiseOrNot } from "./helpers/types";
import { CancelError } from "./helpers/clack";

export class MenuError extends Error {}
export type Task = () => PromiseOrNot<Navigation>;

export type MenuOption =
  & {
    label: string;
    hint?: string;
  }
  & (
    {
      task: Task;
    } | {
      options: MenuOption[];
    }
  );

export enum Navigation {
  BACK,
  COMPLETE,
}

export const runMenu = async (
  menu: MenuOption,
  menuHistory: MenuOption[] = [],
) => {
  if ("task" in menu) {
    const result = await menu.task();
    switch (result) {
      case Navigation.COMPLETE:
        return;
      case Navigation.BACK:
        const previous = menuHistory.pop();
        if (!previous) throw new MenuError("No previous menus");
        await runMenu(previous);
        return;
      case undefined:
        throw new MenuError("Task finished without additional info");
    }
    throw new MenuError(`Task finished with unknown value: ${result}`);
  }
  menuHistory.push(menu);

  const selectedIndex = await select({
    message: menu.label,
    options: menu.options.map(({ label, hint }, i) => ({
      value: i,
      label,
      hint,
    })),
  });

  if (isCancel(selectedIndex)) throw new CancelError();

  await runMenu(menu.options[selectedIndex], menuHistory);
};
