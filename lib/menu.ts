import { log, note, select, text } from "@clack/prompts";
import { parseError } from "./helpers/errors";

export type MenuOption =
  & {
    label: string;
    hint?: string;
  }
  & (
    {
      task: () => void | Promise<void>;
    } | {
      options: MenuOption[];
    }
  );

export const runMenu = async (menu: MenuOption) => {
  if ("task" in menu) {
    await menu.task();
    return;
  }

  const selectedIndex = await select({
    message: menu.label,
    options: menu.options.map(({ label, hint }, i) => ({
      value: i,
      label,
      hint,
    })),
  });

  if (typeof selectedIndex === "symbol") throw "Cancelled";

  await runMenu(menu.options[selectedIndex]);
};
