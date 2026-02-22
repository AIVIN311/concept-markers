# Trust Stack Tag Schema v0.1

This document defines a minimal Trust Stack tagging layer for the identity-bearing topology.
It is a frontmatter-only extension for `ops/site-copy/*.md` and does not modify locksheet schema,
HTML pages, JSON-LD fields, or marker runtime behavior.

## Purpose

Trust Stack tags distinguish trust-loop function within the same `semantic_role`.

Example:

- `syntheticattestation` and `syntheticverification` may both be `semantic_role: "trust-primitive"`
- Trust Stack tags separate their roles:
  - attestation = assertion generation
  - verification = continuous validity management

## Scope (v0.1)

v0.1 applies only to the trust trio:

- `syntheticattestation`
- `syntheticverification`
- `syntheticliability`

Other sites are out of scope for v0.1 and MUST NOT receive Trust Stack tags unless this spec is
revised.

## Trust Stack Model (v0.1)

Trust loop (conceptual order):

1. Attestation: a claim/assertion is produced and can be cited.
2. Verification: the claim is re-checked over time and across contexts.
3. Liability / Enforcement: responsibility is assigned when claims fail or misuse occurs.

Topology implication (closure condition summary):

- Before trust-trio closure, these nodes may appear only as a concept cluster (semantic adjacency).
- After `syntheticattestation`, `syntheticverification`, and `syntheticliability` are all `locked`
  with valid v0.1 Trust Stack tags, the trust trio becomes the first process cluster in the
  identity-bearing topology (`assert -> verify -> enforce`).
- This is a topology state transition, not a copywriting change.

Reserved future layer (not assigned in v0.1):

- `identity-claim`

## Frontmatter Fields (site-copy only)

Add these YAML frontmatter fields to `ops/site-copy/<slug>.md` for in-scope trust nodes:

1. `trust_stack_layer`
2. `trust_stack_function`

These fields are supplemental operational metadata and MUST NOT alter or override:

- `concept_axis`
- `subaxis`
- `group_id`
- `identity_intent`
- `in_defined_term_set`
- `semantic_role`

## Enums (v0.1)

### `trust_stack_layer`

Allowed values:

- `identity-claim` (reserved; not used by v0.1 trust trio)
- `attestation`
- `verification`
- `liability-enforcement`

### `trust_stack_function`

Allowed values for v0.1:

- `assertion-generation`
- `assertion-validity-management`
- `responsibility-enforcement`

## Authoritative Mapping (v0.1)

| `site_slug`             | `trust_stack_layer`     | `trust_stack_function`          |
| ----------------------- | ----------------------- | ------------------------------- |
| `syntheticattestation`  | `attestation`           | `assertion-generation`          |
| `syntheticverification` | `verification`          | `assertion-validity-management` |
| `syntheticliability`    | `liability-enforcement` | `responsibility-enforcement`    |

## Change-Time Guardrail (Hard Rule)

Trust Stack tags in v0.1 MAY change only in these two situations:

1. Retrofit of an already `locked` trust-trio node:
   - scope limited to that site's `ops/site-copy/<slug>.md` frontmatter only
2. The trust-trio node's lock step (Phase 3):
   - tags are written/validated in the same atomic commit as that site's lock action

All other changes (for example, expanding tags to more sites or changing mappings ad hoc) are
treated as a spec revision and MUST NOT be inserted into the current Phase 3 flow.

## Lock-Step Integration (Phase 3)

For an in-scope trust-trio site during `draft -> locked`:

1. Derive/validate `semantic_role` using the existing deterministic rule from `concept_axis`
2. Add or validate:
   - `trust_stack_layer`
   - `trust_stack_function`
3. Ensure values match the authoritative mapping table above

## Retrofit Rule for Already-Locked Nodes

Already-locked trust-trio nodes MAY be retrofitted with Trust Stack tags in a docs-only change:

- Modify only `ops/site-copy/<slug>.md` frontmatter
- Do not modify page HTML
- Do not modify locksheet schema
- Locksheet row changes are optional and not required for v0.1 retrofit

## Manual Audit Rules (v0.1, no code)

For any `locked` trust-trio `ops/site-copy/*.md` file:

1. `trust_stack_layer` MUST exist
2. `trust_stack_function` MUST exist
3. Values MUST be valid enums
4. Values MUST match the authoritative mapping table
5. `semantic_role` MUST still match the existing deterministic mapping rule

For `draft` files:

- Trust Stack tags MAY be absent until lock step

## Non-Goals (v0.1)

This spec does not:

- add locksheet columns
- define JSON-LD trust fields
- change bridge-edge gates
- change topology grouping or `data-series`
- enforce audit code implementation

## v0.2 Candidates (Deferred)

Potential future extensions (not in v0.1):

- `syntheticcertification`
- `protocolaccountability`
- additional trust-loop phases or composite analytics tags
