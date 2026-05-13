# Phase 3 Guardrails

1. No HTML modifications by default.
   - Exception: a single-page, head-only machine-semantic pilot may modify
     `civilizationcaching/index.html` when explicitly requested and documented in
     `docs/PHASE3_MACHINE_SEMANTIC_SPEC.md`.
2. No `git stash -u`.
3. Use git worktree for isolated locking.
