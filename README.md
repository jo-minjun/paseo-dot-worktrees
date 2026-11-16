# paseo-dot-worktrees

English | [한국어](README.ko.md)

A [Paseo](https://paseo.sh) plugin that creates worktrees inside each project, under `.worktrees/`, instead of `~/.paseo/worktrees/<hash>/`.
New branches start from the latest `origin/<base>`, not from a possibly stale local branch.

```
~/Projects/app/
├── .worktrees/
│   ├── .gitignore      # "*", written by the plugin
│   ├── tidy-fox/
│   └── feature-login/
└── src/
```

## How it works

The plugin uses the `worktree.create.before` hook and sets the worktree path to `<repository root>/.worktrees/<worktree name>`.

- The worktree name is the one Paseo would use for the default location. Slashes become hyphens.
- The repository root is the main checkout, so a worktree created from another worktree is not nested.
- The plugin writes `.worktrees/.gitignore` with `*` if the file does not exist. The worktrees do not show up in `git status`, and the project's own `.gitignore` stays unchanged.
- Paseo lists, restores, and archives these worktrees like the ones at the default location.
- For a new branch, the plugin changes the base `main` to `origin/main` when `origin/main` exists, and Paseo fetches it before creating the worktree. The app's base picker always sends the plain name (`main`), and Paseo would otherwise use the local `main`, which may be behind. A base that exists only locally is left unchanged.

## Install

Requires Paseo 0.14.0-beta.1 or later with plugins enabled (**Settings → Plugins → Enable plugins**).

```bash
paseo plugin install git:jo-minjun/paseo-dot-worktrees
```

## Limits

- Only new worktrees use `.worktrees/`. Existing worktrees stay where they are.
- Tools that do not read `.gitignore` (some IDE indexers, test runners, or build tools) can still scan `.worktrees/`. Exclude it in those tools if needed.
- Paseo refuses a path that already exists. If `.worktrees/<name>` is left over, remove it before creating a worktree with the same name.
- The base rewrite cannot tell a deliberately chosen local branch from the default. If `origin/<base>` exists, the new branch starts from it, so commits that are only on the local branch are not included. Pass `--base refs/heads/<branch>` in the CLI to keep the local branch.

## License

[MIT](LICENSE)
