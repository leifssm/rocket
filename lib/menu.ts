import { log, note, select, text } from "@clack/prompts";


type MenuOption = {
  label: string;
  hint?: string;
} & (
  {
    protocol: () => void | Promise<void>;
  } | {
    options: MenuOption[];
  }
)

export const runMenu = async (menu: MenuOption) => {
  if ("protocol" in menu) {
    await menu.protocol();
    return;
  }

  const selectedIndex = await select({
    message: menu.label,
    options: menu.options.map(({ label, hint }, i) => ({ value: i, label, hint }))
  });

  if (typeof selectedIndex === "symbol") {
    throw new Error(`${selectedIndex.toString()}: ${selectedIndex.description}`);
  }
  
  await runMenu(menu.options[selectedIndex]);
}

