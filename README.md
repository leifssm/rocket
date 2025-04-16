
# Rocket

A wrapper CLI for Git and [GitHub CLI](https://cli.github.com/). Uses [Bun](https://bun.sh/) to compile to an `.exe` that can be run from the terminal and adds shorthand commands for ease of use. Currently supported commands are:
- Open local repo
- Create new repo both locally and on GitHub
- Upload existing repo to GitHub
## Run Locally

Make sure you have [GitHub CLI](https://cli.github.com/) installed by running

```bash
  gh
```

Clone the project

```bash
  git clone git@github.com:leifssm/rocket.git
```

Go to the project directory

```bash
  cd rocket
```

Install dependencies

```bash
  bun install
```

Edit the `./lib/constants.ts` file to include your dev folder and you GitHub username

```js
export const DEV_FOLDER = "~/dev/";
export const GITHUB_USER = "YOUR_GITHUB_USERNAME";
```

### Developing

Run the program by running

```bash
  bun run dev
```

Or, compile it to an .exe: 

### Building

Either build it to `./build/rocket.exe`

```bash
  bun run build:test
```

Or, build it to `~/dev/executables/rocket.exe`

```bash
  bun run build:global
```

Add the `.exe`'s parent folder to PATH and run it with

```bash
  rocket
```