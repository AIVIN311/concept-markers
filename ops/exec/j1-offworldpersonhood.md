# Route A / Phase J1: Lock `offworldpersonhood` via Worktree + Quarantine (Docs-Only, Atomic)

## Summary

Execute J1 as a single docs-layer lock for `offworldpersonhood` using a clean worktree and a 2-file atomic commit, then `cherry-pick` back to `main`.

This phase locks only:

1. `ops/site-copy/offworldpersonhood.md` (draft -> locked)
2. `ops/new-sites-locksheet.md` (`offworldpersonhood.com` row only: `status + notes`)

No runtime HTML changes. No schema/governance changes.

## Important Changes / Interfaces / Types

- No public/runtime/API changes
- No `*/index.html` changes
- No locksheet schema changes
- No governance/runbook/schema changes
- Only docs-layer changes:
  - `ops/site-copy/offworldpersonhood.md`
  - `ops/new-sites-locksheet.md` (single row only)

## Current State (Grounded)

- `ops/site-copy/offworldpersonhood.md` exists in **main** as untracked draft (`??`)
- `ops/new-sites-locksheet.md` row for `offworldpersonhood.com` is `draft`
- `offworldpersonhood/index.html` remains placeholder and must not be changed
- Main workspace is intentionally dirty; lock execution must not run there

## Scope (Strict)

### In scope

1. `ops/site-copy/offworldpersonhood.md` (lock file)
2. `ops/new-sites-locksheet.md` (`offworldpersonhood.com` row only)

### Out of scope

- Any `*/index.html`
- Any other row in `ops/new-sites-locksheet.md`
- `domains.json`
- `networklayer/markers.js`
- `ops/trust-trio-*`
- `ops/schemas/*`
- Governance/SOP docs

## Locked Content Decisions

### `ops/site-copy/offworldpersonhood.md`

Use the existing approved draft content as the source.

Allowed changes in lock step:

1. Frontmatter: `status: draft` -> `status: locked`
2. `## Lock Notes`: replace draft wording with locked wording

Keep unchanged:

- EN/ZH body bullets
- `semantic_role: "identity-anchor"`
- `bridge_body_evidence` (paragraph 4, `jurisdiction` + `sovereignty`, `requires`)
- all other approved metadata unless required for lock wording only

### `ops/new-sites-locksheet.md` row notes exact string

Set `offworldpersonhood.com` row `notes` to:

- `Copy lock: ops/site-copy/offworldpersonhood.md (v1); semantic_role=identity-anchor; docs-only`

## Execution Model

### Main workspace (`c:\dev\concept-markers`)

- Intentionally dirty
- No Phase lock commit here
- Used only for quarantine + cherry-pick + post-verification

### Lock execution workspace (`c:\dev\cm-lock-exec`)

- Clean worktree on branch `phase3-lock-exec`
- All edits, gates, and atomic commit happen here

## Step-by-Step Procedure (Decision Complete)

### Step 1 — Create clean worktree and pass clean gate

Before creating the worktree, run `git worktree list`.

- If `c:\dev\cm-lock-exec` already exists, do not create; reuse it and proceed to clean gate.
- If it does not exist, create it as specified.

In main:

1. Create worktree `c:\dev\cm-lock-exec` on branch `phase3-lock-exec` (if missing)
2. Enter worktree
3. Run hard clean gate:
   - `git diff --name-only`
   - `git status --porcelain`

Both must be empty. If not, stop.

### Step 2 — Materialize locked `offworldpersonhood` site-copy file in worktree

The main workspace draft is read-only source; do not edit it in place. Copy content into the worktree file, then apply only the allowed lock-step edits (`status`, `Lock Notes`).

Because the file is untracked only in main, worktree will not have it.

In worktree:

1. Create `ops/site-copy/offworldpersonhood.md` using the approved draft content from main
2. Set frontmatter `status: locked`
3. Replace `## Lock Notes` with locked wording (docs-only lock; runtime unchanged; bridge evidence recorded; row lock completed)
4. Keep EN/ZH body unchanged
5. Keep accepted `semantic_role` and `bridge_body_evidence`

### Step 3 — Lock the row in `ops/new-sites-locksheet.md` (single row only)

Modify only `offworldpersonhood.com` row:

1. `status: draft -> locked`
2. `notes` -> `Copy lock: ops/site-copy/offworldpersonhood.md (v1); semantic_role=identity-anchor; docs-only`

No other row changes.

### Step 4 — Corrected atomic gates in worktree (untracked-aware)

#### 4.1 Working tree scope gate

Run:

- `git status --porcelain`

Expected exactly:

- ` M ops/new-sites-locksheet.md`
- `?? ops/site-copy/offworldpersonhood.md`

If anything else appears, stop.

#### 4.2 Stage only target files

Run:

- `git add ops/site-copy/offworldpersonhood.md ops/new-sites-locksheet.md`

#### 4.3 Staged atomic gates (primary)

Run:

- `git diff --cached --name-only`
- `git diff --cached --stat`

Both must show exactly these 2 files:

- `ops/site-copy/offworldpersonhood.md`
- `ops/new-sites-locksheet.md`

If more than 2 files appear, stop.

### Step 5 — Atomic commit in worktree

Commit:

- `locksite(offworldpersonhood): add site-copy v1 + lock row`

Post-commit check:

- `git show --name-only --pretty="" HEAD` must list exactly 2 files

### Step 6 — Quarantine main untracked draft before cherry-pick

In main:

1. Run path-level safety check:
   - `git status --porcelain -- ops/new-sites-locksheet.md ops/site-copy/offworldpersonhood.md`
2. Expected:
   - only `?? ops/site-copy/offworldpersonhood.md`
   - no local change on `ops/new-sites-locksheet.md`

If `ops/new-sites-locksheet.md` shows local changes at any point, stop.

#### Step 6.2 — Quarantine the untracked draft

Ensure `_ops/quarantine/` exists (create if missing) before moving the file.

Move untracked draft to:

- `_ops/quarantine/offworldpersonhood.md.prelock`

Re-run path-level safety check:

- must return no output

### Step 7 — Cherry-pick lock commit to main

In main:

1. Get worktree commit hash (`git -C c:\dev\cm-lock-exec rev-parse HEAD`)
2. `git cherry-pick <hash>`

If conflict occurs:

- resolve only in:
  - `ops/site-copy/offworldpersonhood.md`
  - `ops/new-sites-locksheet.md`
- do not touch unrelated dirty state

### Step 8 — Quarantine compare and cleanup (Corrected Rule)

Because full-file identity is impossible by design, use this deterministic compare rule.

For comparison, treat the markdown as four slices by headings:

1. Frontmatter block (`---` to `---`)
2. `## Identity Sentence` section (until next `##`)
3. `## Body Copy` section (until next `##`)
4. `## Lock Notes` section (ignored / allowed to differ)

#### Required equality (after LF normalization)

- Slice (1): allow only `status` delta (`draft` vs `locked`)
- Slice (2): require exact match
- Slice (3): require exact match

#### Allowed differences

- Slice (4) `## Lock Notes`
- Slice (1) frontmatter `status` only

#### Cleanup rule

- If compare passes -> delete `_ops/quarantine/offworldpersonhood.md.prelock`
- If compare fails -> keep quarantine file and stop for manual review

### Step 9 — Worktree cleanup (ephemeral)

After successful cherry-pick and quarantine compare:

- `git worktree remove c:\dev\cm-lock-exec`
- `git branch -D phase3-lock-exec`

## Verification Plan (Required)

### Atomicity / scope

1. Worktree commit:
   - `git show --name-only --pretty="" HEAD` => exactly 2 files
2. Main cherry-picked commit:
   - `git show --name-only --pretty="" HEAD` => exactly 2 files

### Row / file state

3. `ops/new-sites-locksheet.md` `offworldpersonhood.com` row is `locked`
4. Row `notes` exactly:
   - `Copy lock: ops/site-copy/offworldpersonhood.md (v1); semantic_role=identity-anchor; docs-only`
5. `ops/site-copy/offworldpersonhood.md` frontmatter has:
   - `status: locked`
   - `semantic_role: "identity-anchor"`
   - accepted bridge evidence unchanged and present

### Runtime immutability

6. `git diff --name-only -- '*.html'` returns no output
7. Baseline r1 compare remains PASS for the 12-file batch (recommended)

### Main workspace preservation

8. `run_prettier_all.ps1` remains unchanged (user-owned dirty state)
9. `domains-67` and untracked site folders remain untouched
10. quarantine file deleted only on compare pass

## Stop Point (Mandatory)

After J1 completes and verification passes:

- Stop
- Review row-lock result, notes convention, and bridge evidence ergonomics
- Do not proceed to `orbitaljurisdiction` in the same batch unless explicitly requested

## Failure Conditions

- Worktree clean gate fails
- Working tree scope gate shows extra files
- Staged diff shows >2 files
- Main path-level safety check shows local change on `ops/new-sites-locksheet.md`
- Quarantine compare fails outside allowed deltas (`status`, `Lock Notes`)
- Any `*.html` appears in diff

## Explicit Assumptions / Defaults

1. The current main-workspace `ops/site-copy/offworldpersonhood.md` draft is the approved source content for J1.
2. J1 is docs-only; runtime implementation remains deferred.
3. Quarantine path defaults to `_ops/quarantine/offworldpersonhood.md.prelock` (local-only, untracked).
4. `docs-only` suffix in row notes is part of the standardized docs-lock grep pattern.
5. Worktree branch/path are ephemeral and will be removed after successful cherry-pick.
