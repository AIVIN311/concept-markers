# Trust Trio Lock Execution Runbook

(Docs-Only, Atomic, Clean Worktree Required)

Status: Stable v1
Scope: Trust Trio Docs-Layer Only
Applies To: syntheticattestation, syntheticverification, syntheticliability
Does Not Apply To: 12-site identity batch

---

## 0. Purpose

This runbook defines the **official execution protocol** for locking a Trust Trio node
(`syntheticattestation` -> `syntheticverification` -> `syntheticliability`)
at the **docs layer only**, using:

- Clean worktree
- 2-file atomic commit
- Cherry-pick back to main
- Zero runtime HTML modification

This document supersedes any earlier ad-hoc lock instructions.

---

## 1. Execution Model

### Main workspace

- Path: `c:\dev\concept-markers`
- Intentionally dirty
- **Never used for Phase 3 lock execution**
- No `git add` / `git commit` for trust-trio lock

### Lock execution workspace

- Path: `c:\dev\cm-lock-exec`
- Branch: `phase3-lock-exec`
- Must be clean
- All atomic work occurs here

---

## 2. Hard Rules

1. No `git stash -u`
2. No modification of any `*/index.html`
3. No scope expansion beyond the two docs files
4. Atomic commit must contain exactly 2 files
5. No trust-trio row edits except the targeted node
6. No 12-site locksheet modification
7. Runtime bytes must remain unchanged

Violation of any rule -> abort execution.

---

## 3. Step 1 — Clean Worktree Gate

Run in `c:\dev\cm-lock-exec`:

```powershell
git diff --name-only
git status --porcelain
```

Both must produce **no output**.

If not empty -> STOP.

Optional verification:

```powershell
git rev-parse --show-toplevel
git branch --show-current
```

Confirm correct repo and branch.

---

## 4. Step 2 — Create Docs Lock File

File:

```
ops/site-copy/<site_slug>.md
```

If directory does not exist, create it.

### Source (read-only)

Main workspace runtime HTML:

```
c:\dev\concept-markers\<site_slug>\index.html
```

### Mirror Requirements

- EN paragraphs: exact count must match runtime (e.g., 11)
- ZH paragraphs: exact count must match runtime
- Do not merge or split paragraphs
- Do not run formatters on this file
- Do not alter runtime HTML

### Required Sections

```
## Identity Sentence
## Body Copy
### EN (bullets)
### ZH (bullets)
## Lock Notes
```

### Lock Notes Must Include

- docs-only lock
- runtime unchanged
- trust-trio flow reference
- bridge evidence explanation
- explicit legacy paragraph count statement (e.g., 11/11 legacy exception)

---

## 5. Step 3 — Update Trust-Trio Locksheet

Modify only the row for target node in:

```
ops/trust-trio-locksheet.md
```

Changes allowed:

- status: draft -> locked
- notes: replace with official lock note string

No other row edits permitted.

---

## 6. Step 4 — Atomic Commit Protocol (Corrected Gates)

Because one file is newly created (untracked),
**working tree diff alone is insufficient**.

Atomicity is enforced in three layers:

---

### 6.1 Working Tree Scope Gate

```powershell
git status --porcelain
```

Output must include exactly:

- ` M ops/trust-trio-locksheet.md`
- `?? ops/site-copy/<site_slug>.md`

No other files allowed.

If additional lines exist -> STOP.

---

### 6.2 Stage Only Target Files

```powershell
git add ops/site-copy/<site_slug>.md ops/trust-trio-locksheet.md
```

---

### 6.3 Staged Scope Gate (Primary Atomic Gate)

```powershell
git diff --cached --name-only
```

Must list exactly:

- ops/site-copy/<site_slug>.md
- ops/trust-trio-locksheet.md

Then:

```powershell
git diff --cached --stat
```

Must show only those two files.

If more than two files -> STOP.

---

### 6.4 Commit

```powershell
git commit -m "lock(trust-trio): <site_slug> docs-only lock"
```

---

### 6.5 Post-Commit Atomic Verification

```powershell
git show --name-only --pretty=""
```

Must list exactly two files.

---

## 7. Step 5 — Cherry-Pick to Main

Switch to main workspace:

```
c:\dev\concept-markers
```

Path-level safety check:

```powershell
git status --porcelain -- ops/trust-trio-locksheet.md ops/site-copy/<site_slug>.md
```

Must produce no output.

Then:

```powershell
git -C c:\dev\cm-lock-exec rev-parse HEAD
git cherry-pick <commit-hash>
```

If conflict occurs:

- Resolve only within the two docs files
- Do not modify any other local changes

---

## 8. Step 6 — Worktree Cleanup

After successful cherry-pick:

```powershell
git worktree remove c:\dev\cm-lock-exec
git branch -D phase3-lock-exec
```

Note: `-D` is expected due to cherry-pick strategy (non-merge ancestry).

---

## 9. CRLF / LF Policy

If warning appears:

```
CRLF will be replaced by LF
```

This is acceptable under `.gitattributes` normalization policy.

Atomicity and file scope must remain correct.
Line ending normalization does not invalidate the lock if confined to targeted file.

---

## 10. Post-Execution Acceptance Criteria

1. No `*/index.html` modified
2. Trust-trio rows all show `locked`
3. Lock file exists and contains required sections
4. Commit contains exactly 2 files
5. Main dirty state remains unchanged
6. Baseline r1 compare still PASS

---

## 11. Failure Conditions

Abort immediately if:

- Clean gate fails
- More than 2 files staged
- Non-target rows modified
- Runtime HTML modified
- Scope expansion detected

---

## 12. Design Philosophy

This protocol ensures:

- Runtime immutability
- Atomic documentation locks
- Auditable trust-trio closure
- Isolation from main workspace noise
- Deterministic change boundaries

Trust-trio lock is a **docs-layer contract**, not a runtime mutation.

---

# End of Runbook

---
