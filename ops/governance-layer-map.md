# Governance Layer Map (Runtime / Docs / Execution)

This repo is governed as a 3-layer system:

- **L0 Runtime**: public bytes served to users/crawlers.
- **L1 Docs Contract**: human-auditable semantic contracts + lock state.
- **L2 Execution Governance**: SOPs, guardrails, normalization policies.

The goal is to make changes **auditable, reproducible, and scope-controlled**.

---

## 1) Layer Overview

### L0 — Runtime Layer (Public Bytes)

**What it is**

- The actual pages served on each host.

**Primary assets**

- `*/index.html`

**Core rule**

- Phase 3 locks must not change runtime bytes unless explicitly intended.
- Avoid “meaningless drift” (formatters, line-endings, batch rewrites).

**Verification**

- Baseline compare (size + SHA256) for locked sets.

---

### L1 — Docs Contract Layer (Semantic Contract)

**What it is**

- A mirror + contract that describes what is locked, why it is locked, and how it relates.

**Primary assets**

- `ops/site-copy/*.md`
- `ops/*locksheet*.md`
  - `ops/trust-trio-locksheet.md`
  - `ops/new-sites-locksheet.md` (SOP + state + incident notes)
- `_ops/*.json` (local-only evidence, if applicable)

**Core rule**

- Docs locks must be **atomic and grep-friendly**.
- State tables must enforce **row-scope** (only touch the targeted row).

**Verification**

- Atomic commit scope checks:
  - exactly N files (e.g., trust-trio lock = 2 files)
  - `git show --name-only` matches expected file list

---

### L2 — Execution Governance Layer (How Work Is Done)

**What it is**

- Runbooks, guardrails, and normalization policies that prevent recurrence of incidents.

**Primary assets**

- `ops/trust-trio-lock-exec.md` (official runbook)
- `.gitattributes` (LF normalization policy)
- Phase SOP docs (e.g., Phase 3 “no stash -u” guardrails)

**Core rule**

- Lock execution must occur in a **clean worktree**.
- No `git stash -u` for Phase 3 execution.
- Enforce gates that include untracked + staged scopes.

**Verification**

- Worktree clean gate (`git diff --name-only` empty, `git status --porcelain` empty)
- Corrected gates (working tree scope + staged scope)

---

## 2) Constraint Relationships (How Layers Bind Each Other)

- **L2 constrains L1**: runbooks define _how_ docs locks must be created (gates, atomicity).
- **L1 constrains L0**: docs locks define the contract that runtime should reflect (or remain unchanged).
- **L0 is the truth**: public bytes are the final surface area; everything else exists to control drift.

Baseline manifests exist to protect L0 immutability during critical phases.

---

## 3) Allowed Change Types by Layer

### L0 (Runtime)

- Intended: copy revisions, metadata changes, JSON-LD changes (only when explicitly planned).
- Forbidden during lock execution: formatter-driven drift, batch rewrites.

### L1 (Docs Contract)

- Add/lock `ops/site-copy/<site>.md`
- Update a single lock row (row-scope)
- Add process cluster descriptors (machine-readable)

### L2 (Execution Governance)

- Add/modify runbooks
- Add/modify normalization policies
- Add gates and incident-derived guardrails

---

## 4) Canonical Gates (Summary)

### Trust Trio docs-only lock

- Worktree clean gate must pass.
- Working tree scope gate must show exactly:
  - `M ops/trust-trio-locksheet.md`
  - `?? ops/site-copy/<site>.md`
- Staged scope gate must show exactly 2 files:
  - `ops/site-copy/<site>.md`
  - `ops/trust-trio-locksheet.md`

---

## 5) Commit Message Taxonomy (Governance-Aligned)

All commits should declare the layer they primarily affect:

### L0 Runtime

- `runtime(<site>): ...` (public bytes changed)
- `locksite(<site>): ...` (runtime + required docs contract, if applicable)

### L1 Docs Contract

- `lock(trust-trio): ...` (atomic docs lock for trust-trio)
- `docs(<area>): ...` (documentation, contracts, maps)
- `data(<area>): ...` (machine-readable descriptors / manifests committed)

### L2 Execution Governance

- `spec(phase3): ...` (guardrails, policies, SOP updates)
- `spec(<area>): ...` (normalization rules, runbooks, gates)
- `infra(<area>): ...` (tooling changes, scripts that enforce the above)

**Rule of thumb**: If a commit touches `*/index.html`, it is not purely docs/spec.
