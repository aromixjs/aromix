# CI/CD

## Version (`version.yml`)

Triggered when change files are pushed to `main` (path: `change/**`).

1. Installs dependencies
2. Checks if change files exist (`change/*.json`)
3. Builds all packages
4. Runs `beachball bump` to bump versions, update changelogs, and remove change files
5. Opens a PR titled `chore: version packages` with the version bumps

## Publish (`publish.yml`)

Triggered when versioned `package.json` or `CHANGELOG.json` are pushed to `main` (from the merged version PR).

1. Installs dependencies
2. Verifies the merge was the version PR (commit message starts with `chore: version packages` and no change files remain)
3. Builds all packages
4. Runs `beachball publish` to publish to npm

## Adding a change file

```bash
pnpm change
```

This opens an interactive prompt to describe the change. It creates a JSON file under `change/`. Commit and push it to trigger the version workflow.
