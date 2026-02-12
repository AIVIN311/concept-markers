# Prettier Unify SOP

This project uses a single formatting workflow for HTML, JS, and JSON files.

## Scope

- Included: `*.html`, `*.js`, `*.json`
- Excluded by `.prettierignore`: `node_modules`, backup zip files, `_ops`, OS junk files

## Standards

- Prettier config: `.prettierrc.json`
- Editor fallback rules: `.editorconfig`
- Line ending policy: `LF`

## One-command usage

Run from project root:

```powershell
.\run_prettier_all.ps1
```

Check only (no write, no backup):

```powershell
.\run_prettier_all.ps1 -CheckOnly
```

Write + check but skip backup:

```powershell
.\run_prettier_all.ps1 -SkipBackup
```

## What the script does

1. Validates required commands (`rg`, `npx`) and root files.
2. Creates `_ops`.
3. Creates a zip backup in the parent folder unless skipped.
4. Builds target list with `rg --files -uu` and extension filter.
5. Saves:
   - `_ops/prettier-files.txt`
   - `_ops/prettier-count.txt`
6. Runs Prettier in batches (25 files per batch):
   - `--write` (unless `-CheckOnly`)
   - `--check`
   - `--list-different`
7. Writes logs:
   - `_ops/prettier-write.log`
   - `_ops/prettier-check.log`
   - `_ops/prettier-diff.txt`

## Report files

- `prettier-files.txt`: exact target file list used for this run.
- `prettier-count.txt`: target file count.
- `prettier-write.log`: write phase output.
- `prettier-check.log`: check phase output.
- `prettier-diff.txt`: files still different after check (should be empty when clean).

## Troubleshooting

- `Required command not found`: install or expose `rg` / `npx` in PATH.
- `No target files found`: verify you are in the project root.
- `Prettier check failed`: inspect `_ops/prettier-check.log` and `_ops/prettier-diff.txt`.
- If output looks unexpected, restore from the latest backup zip in the parent folder.
