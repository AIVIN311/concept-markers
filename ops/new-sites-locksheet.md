# New Sites Locksheet (Synthetic Identity Infrastructure Stack)

This locksheet defines the identity metadata contract for the 12-site Synthetic Identity
Infrastructure Stack.

Each row represents one identity-bearing node and must be fully locked before inventory/topology
registration.

## Scope

- Covers only the 12-site identity batch prework.
- Defines locksheet schema, normalization rules, and lock criteria.
- Does not replace page copy standards in `ops/new-marker-copy-standard.md`.

## Canonical Namespace Policy

Use only these canonical termset URLs in lock rows and page JSON-LD `inDefinedTermSet`:

- `https://civilizationcaching.com/termsets/v1/identity`
- `https://civilizationcaching.com/termsets/v1/entity`
- `https://civilizationcaching.com/termsets/v1/verification`
- `https://civilizationcaching.com/termsets/v1/governance`
- `https://civilizationcaching.com/termsets/v1/sovereignty`

Do not use `/termsets/<layer>/v1` in lock rows or pages.

## Field Definitions

| Field                  | Type                  | Required | Description                                                                         |
| ---------------------- | --------------------- | -------- | ----------------------------------------------------------------------------------- |
| `host`                 | string                | yes      | Canonical domain host (for example `syntheticpersonhood.com`)                       |
| `concept_axis`         | enum                  | yes      | Spine stage only: `identity`, `entity`, `verification`, `governance`, `sovereignty` |
| `subaxis`              | array of slug strings | optional | Specialized labels (for example `["jurisdiction","orbital"]`)                       |
| `group_id`             | enum                  | yes      | v3.1 batch-only markers group / `data-series` mapping                               |
| `identity_intent`      | enum                  | yes      | `concept` / `identity` / `governance`                                               |
| `intent_scope`         | array of enum strings | optional | One or more of `technical`, `legal`, `economic`, `social`                           |
| `inDefinedTermSet`     | URL string            | yes      | Canonical termset namespace URL                                                     |
| `identity_sentence`    | string                | yes      | Machine-readable identity anchor (used in JSON-LD `disambiguatingDescription`)      |
| `required_bridge_host` | array of host strings | yes      | Required cross-cluster bridge target(s), AND semantics                              |
| `additionalType`       | array of URL strings  | yes      | JSON-LD type URLs (base type + layer type derived from `concept_axis`)              |
| `title_en`             | string                | yes      | English concept title                                                               |
| `title_zh`             | string                | yes      | Traditional Chinese concept title                                                   |
| `canonical`            | URL string            | yes      | Canonical page URL                                                                  |
| `description_en`       | string                | yes      | English definition/description                                                      |
| `description_zh`       | string                | yes      | Traditional Chinese definition/description                                          |
| `data_marker`          | slug string           | yes      | `<html data-marker="...">` value                                                    |
| `related_links`        | array of host strings | yes      | `meta[name="related"]` hosts (4-6 total)                                            |
| `status`               | enum                  | yes      | `draft` / `locked`                                                                  |
| `notes`                | string                | optional | Freeform reviewer notes (non-normative)                                             |

## Allowed Values

### `concept_axis` (hard enum)

- `identity`
- `entity`
- `verification`
- `governance`
- `sovereignty`

### `group_id` (v3.1 batch-only hard enum)

- `identity_data`
- `governance`
- `synthetic_systems`
- `sovereign_infrastructure`

Any new `group_id` requires spec bump before use.

### `identity_intent`

- `concept`
- `identity`
- `governance`

Batch usage rule (v3.1):

- `concept_axis` in `{identity, entity}` -> `identity_intent = identity`
- `concept_axis` in `{verification, governance, sovereignty}` -> `identity_intent = governance`

`identity_intent = concept` remains schema-valid but is not used in this batch.

### `intent_scope` (optional, multi-valued)

- `technical`
- `legal`
- `economic`
- `social`

## Storage and Normalization Rules

### `subaxis` (canonical array storage)

- Canonical persisted format is a JSON array of lowercase slug strings.
- `subaxis` MUST NOT duplicate `concept_axis`.
- Temporary draft input may be a comma-separated string, but rows cannot be marked `locked` until
  normalized to array format.

Examples:

- `["jurisdiction","orbital"]` ✅
- `jurisdiction,orbital` (draft input only; normalize before lock) ✅
- `Jurisdiction, Orbital` ❌

### `required_bridge_host` (canonical array storage)

- Canonical persisted format SHOULD be a JSON array even for one host.
- Draft input may be a single string, but normalize to array before lock.

Matching semantics (audit contract):

1. If stored as string during draft, one host must appear in `meta[name="related"]`.
2. If stored as array, ALL hosts must appear in `meta[name="related"]` (AND semantics).
3. Array order is not significant.

Host normalization before comparison:

1. lowercase
2. strip `http://` or `https://`
3. strip `www.`
4. strip path/query/fragment
5. trim trailing slash

v1 scope note:

- `punycode/IDN` is out of scope for v1 audit; bridge hosts in this batch are ASCII-only.

## Deterministic `additionalType` Rule

`additionalType` MUST be an array of exactly 2 URLs:

1. Base type (constant):
   - `https://civilizationcaching.com/types/IdentityConcept`
2. Layer type (derived from `concept_axis`, not hand-written)

Authoritative derivation table:

| `concept_axis` | Second `additionalType` URL                                      |
| -------------- | ---------------------------------------------------------------- |
| `identity`     | `https://civilizationcaching.com/types/IdentityLayerConcept`     |
| `entity`       | `https://civilizationcaching.com/types/EntityLayerConcept`       |
| `verification` | `https://civilizationcaching.com/types/VerificationLayerConcept` |
| `governance`   | `https://civilizationcaching.com/types/GovernanceLayerConcept`   |
| `sovereignty`  | `https://civilizationcaching.com/types/SovereigntyLayerConcept`  |

Audit rule:

- Audit computes the expected second URL from `concept_axis` and rejects mismatches.
- Manual deviations are not allowed in v3.1.

## `identity_sentence` Quality Gate

Purpose:

- Ensure `identity_sentence` functions as machine-readable `disambiguatingDescription`, not a slogan.

Hard gates (v1):

1. Length (trimmed Unicode codepoint count): `80-200`
2. Must start with the canonical EN concept title (`title_en`)
3. Must include at least one allowed identity verb token (case-insensitive)
4. Must include at least one governance/interoperability semantic token (case-insensitive)

Allowed identity verb tokens (v1):

- `defines`
- `establishes`
- `ensures`
- `formalizes`
- `frames`
- `provides`
- `explores`
- `institutionalizes`
- `positions`

Allowed governance/interoperability semantic tokens (v1):

- `framework`
- `governance`
- `jurisdiction`
- `authority`
- `accountability`
- `obligations`
- `rights`
- `membership`
- `verification`
- `credentials`
- `interoperability`
- `infrastructure`
- `auditable`
- `governable`

## `meta[name="related"]` Lock Rule

Hard rules (v3.1):

1. `related_links` count must be `4-6`
2. `related_links` must include all `required_bridge_host` values
3. Matching is case-insensitive and host-normalized

Editorial preference (warning-level only in v1 audit):

- Non-bridge neighbors should prefer same-layer or adjacent-layer nodes along the spine:
  `identity <-> entity <-> verification <-> governance <-> sovereignty`

## Example Row (Schema + Formatting)

The row below shows canonical persisted formatting for array-like fields (JSON arrays in table cells):

| host                      | concept_axis | subaxis                      | group_id        | identity_intent | intent_scope            | inDefinedTermSet                                       | required_bridge_host             | additionalType                                                                                                           | identity_sentence                                                                                                                                         | title_en               | title_zh   | canonical                          | description_en                                                                                                          | description_zh                                                         | data_marker           | related_links                                                                                                                           | status  |
| ------------------------- | ------------ | ---------------------------- | --------------- | --------------- | ----------------------- | ------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `syntheticpersonhood.com` | `identity`   | `["personhood","synthetic"]` | `identity_data` | `identity`      | `["technical","legal"]` | `https://civilizationcaching.com/termsets/v1/identity` | `["algorithmicsovereignty.com"]` | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/IdentityLayerConcept"]` | `Synthetic Personhood formalizes the recognition of artificial agents as identity-bearing entities capable of participating in legal and social systems.` | `Synthetic Personhood` | `合成人格` | `https://syntheticpersonhood.com/` | `A concept marker for examining how synthetic agents become identity-bearing entities within legal and social systems.` | `概念標記：檢視合成代理如何成為可被法律與社會系統辨識的身份承載實體。` | `syntheticpersonhood` | `["hybridpersonhood.com","offworldpersonhood.com","syntheticlegalentity.com","syntheticverification.com","algorithmicsovereignty.com"]` | `draft` |

## 12-Site Template (Locksheet Rows)

Use this table as the working locksheet. Fill all metadata and copy-linked fields before marking a
row `locked`.

| host                           | concept_axis   | subaxis                         | group_id                   | identity_intent | intent_scope | inDefinedTermSet                                           | required_bridge_host                                       | additionalType                                                                                                               | identity_sentence                                                                                                                                                           | title_en                    | title_zh       | canonical                               | description_en                                                                                                                                                              | description_zh                                                                     | data_marker                | related_links                                                                                                                                                                        | status   | notes                                                                                                                                           |
| ------------------------------ | -------------- | ------------------------------- | -------------------------- | --------------- | ------------ | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | -------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `hybridpersonhood.com`         | `identity`     | `["personhood","hybrid"]`       | `identity_data`            | `identity`      | `[]`         | `https://civilizationcaching.com/termsets/v1/identity`     | `["algorithmicsovereignty.com"]`                           | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/IdentityLayerConcept"]`     | `Hybrid Personhood defines identity continuity across biological and synthetic substrates, establishing a framework for coexistence between human and artificial agents.`   | `Hybrid Personhood`         | `混合人格`     | `https://hybridpersonhood.com/`         | `A concept marker for examining identity continuity across biological and synthetic substrates as human and artificial agents coexist within shared systems.`               | `概念標記：檢視在人類與人工代理共存的系統中，身份如何跨生物與合成基質維持連續性。` | `hybridpersonhood`         | `["offworldpersonhood.com","syntheticpersonhood.com","syntheticlegalentity.com","syntheticverification.com","algorithmicsovereignty.com"]`                                           | `draft`  |                                                                                                                                                 |
| `offworldpersonhood.com`       | `identity`     | `["personhood","offworld"]`     | `identity_data`            | `identity`      | `[]`         | `https://civilizationcaching.com/termsets/v1/identity`     | `["algorithmicsovereignty.com"]`                           | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/IdentityLayerConcept"]`     | `Offworld Personhood explores identity recognition beyond Earth jurisdiction, framing agent existence within extraterrestrial and orbital governance regimes.`              | `Offworld Personhood`       | `離地人格`     | `https://offworldpersonhood.com/`       | `A concept marker for examining how personhood and identity recognition operate beyond Earth-centered jurisdiction across orbital and offworld governance regimes.`         | `概念標記：檢視人格與身份承認如何在地球中心法域之外，於軌道與離地治理體制中運作。` | `offworldpersonhood`       | `["hybridpersonhood.com","syntheticpersonhood.com","orbitaljurisdiction.com","syntheticcitizenship.com","algorithmicsovereignty.com"]`                                               | `draft`  |                                                                                                                                                 |
| `syntheticpersonhood.com`      | `identity`     | `["personhood","synthetic"]`    | `identity_data`            | `identity`      | `[]`         | `https://civilizationcaching.com/termsets/v1/identity`     | `["algorithmicsovereignty.com"]`                           | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/IdentityLayerConcept"]`     | `Synthetic Personhood formalizes the recognition of artificial agents as identity-bearing entities capable of participating in legal and social systems.`                   | `Synthetic Personhood`      | `合成人格`     | `https://syntheticpersonhood.com/`      | `A concept marker for examining how artificial agents become identity-bearing entities capable of recognition, participation, and obligation within institutional systems.` | `概念標記：檢視人工代理如何成為可被制度辨識、參與並承擔義務的身份承載實體。`       | `syntheticpersonhood`      | `["hybridpersonhood.com","offworldpersonhood.com","syntheticlegalentity.com","syntheticcitizenship.com","algorithmicsovereignty.com"]`                                               | `draft`  |                                                                                                                                                 |
| `syntheticlegalentity.com`     | `entity`       | `["legalentity","synthetic"]`   | `governance`               | `identity`      | `[]`         | `https://civilizationcaching.com/termsets/v1/entity`       | `["algorithmicsovereignty.com"]`                           | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/EntityLayerConcept"]`       | `Synthetic Legal Entity establishes a governance container through which artificial agents can hold rights, obligations, and operational accountability.`                   | `Synthetic Legal Entity`    | `合成法律實體` | `https://syntheticlegalentity.com/`     | `A concept marker for examining how synthetic agents are containerized within legal entities that can hold rights, obligations, and operational accountability.`            | `概念標記：檢視合成代理如何被裝載於可承載權利、義務與運作問責的法律實體框架中。`   | `syntheticlegalentity`     | `["syntheticpersonhood.com","syntheticcitizenship.com","protocolaccountability.com","syntheticverification.com","algorithmicsovereignty.com"]`                                       | `draft`  |                                                                                                                                                 |
| `syntheticcitizenship.com`     | `entity`       | `["citizenship","synthetic"]`   | `governance`               | `identity`      | `[]`         | `https://civilizationcaching.com/termsets/v1/entity`       | `["algorithmicsovereignty.com"]`                           | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/EntityLayerConcept"]`       | `Synthetic Citizenship defines membership status for artificial agents within political and institutional systems, enabling participation in sovereign structures.`         | `Synthetic Citizenship`     | `合成公民身分` | `https://syntheticcitizenship.com/`     | `A concept marker for examining how political membership status may be defined for synthetic agents within institutional and sovereign systems.`                            | `概念標記：檢視合成代理的政治成員身分如何在制度與主權系統中被定義。`               | `syntheticcitizenship`     | `["syntheticpersonhood.com","syntheticlegalentity.com","offworldpersonhood.com","protocolaccountability.com","algorithmicsovereignty.com"]`                                          | `draft`  |                                                                                                                                                 |
| `syntheticattestation.com`     | `verification` | `["attestation","synthetic"]`   | `synthetic_systems`        | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/verification` | `["syntheticliability.com"]`                               | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/VerificationLayerConcept"]` | `Synthetic Attestation provides cryptographic and procedural assertions that validate the integrity and provenance of artificial agent identity states.`                    | `Synthetic Attestation`     | `合成鑑證`     | `https://syntheticattestation.com/`     | `A concept marker for examining cryptographic and procedural assertions used to attest the integrity and provenance of synthetic agent identity states.`                    | `概念標記：檢視用於鑑證合成代理身份狀態完整性與來源的密碼學與程序性聲明。`         | `syntheticattestation`     | `["syntheticverification.com","syntheticcertification.com","protocolaccountability.com","syntheticlegalentity.com","syntheticliability.com"]`                                        | `locked` | `Copy lock: ops/site-copy/syntheticattestation.md (v1); semantic_role=trust-primitive`                                                          |
| `syntheticverification.com`    | `verification` | `["verification","synthetic"]`  | `synthetic_systems`        | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/verification` | `["syntheticliability.com"]`                               | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/VerificationLayerConcept"]` | `Synthetic Verification ensures trust in artificial agents by enabling continuous validation of identity claims across platforms and jurisdictions.`                        | `Synthetic Verification`    | `合成驗證`     | `https://syntheticverification.com/`    | `A concept marker for examining continuous verification of synthetic identity claims across platforms, protocols, and jurisdictions.`                                       | `概念標記：檢視合成身份主張如何在平台、協定與法域之間被持續驗證。`                 | `syntheticverification`    | `["syntheticattestation.com","syntheticcertification.com","syntheticpersonhood.com","protocolaccountability.com","syntheticliability.com"]`                                          | `locked` | `Copy lock: ops/site-copy/syntheticverification.md (v1); semantic_role=trust-primitive; trust_stack=verification/assertion-validity-management` |
| `syntheticcertification.com`   | `verification` | `["certification","synthetic"]` | `synthetic_systems`        | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/verification` | `["syntheticliability.com"]`                               | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/VerificationLayerConcept"]` | `Synthetic Certification institutionalizes identity verification outcomes into recognized credentials that enable interoperability within governance ecosystems.`           | `Synthetic Certification`   | `合成認證`     | `https://syntheticcertification.com/`   | `A concept marker for examining how verification outcomes become institutional credentials for synthetic agents across governance ecosystems.`                              | `概念標記：檢視合成代理的驗證結果如何被制度化為可在治理生態中流通的認證憑據。`     | `syntheticcertification`   | `["syntheticattestation.com","syntheticverification.com","syntheticcitizenship.com","protocolaccountability.com","syntheticliability.com"]`                                          | `draft`  |                                                                                                                                                 |
| `protocolaccountability.com`   | `governance`   | `["protocol","accountability"]` | `governance`               | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/governance`   | `["jurisdictionaldrift.com","algorithmicsovereignty.com"]` | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/GovernanceLayerConcept"]`   | `Protocol Accountability defines enforceable responsibility within automated systems, ensuring that identity-linked actions remain auditable and governable.`               | `Protocol Accountability`   | `協定問責`     | `https://protocolaccountability.com/`   | `A concept marker for examining how responsibility becomes enforceable and auditable within protocol-mediated and automated systems.`                                       | `概念標記：檢視責任如何在協定中介與自動化系統內成為可執行且可稽核的結構。`         | `protocolaccountability`   | `["syntheticverification.com","syntheticcertification.com","syntheticlegalentity.com","orbitaljurisdiction.com","jurisdictionaldrift.com","algorithmicsovereignty.com"]`             | `draft`  | `Special case: requires 2 bridge hosts.`                                                                                                        |
| `orbitaljurisdiction.com`      | `governance`   | `["jurisdiction","orbital"]`    | `governance`               | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/governance`   | `["syntheticliability.com"]`                               | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/GovernanceLayerConcept"]`   | `Orbital Jurisdiction establishes governance boundaries for agents operating in space-based infrastructures, extending legal authority beyond terrestrial domains.`         | `Orbital Jurisdiction`      | `軌道管轄權`   | `https://orbitaljurisdiction.com/`      | `A concept marker for examining governance boundaries, authority claims, and liability conditions for agents operating in orbital infrastructures.`                         | `概念標記：檢視在軌道基礎設施中運作的代理，其治理邊界、權威主張與責任條件。`       | `orbitaljurisdiction`      | `["offworldpersonhood.com","protocolaccountability.com","climatejurisdiction.com","computationalsovereignty.com","syntheticliability.com"]`                                          | `draft`  |                                                                                                                                                 |
| `climatejurisdiction.com`      | `governance`   | `["jurisdiction","climate"]`    | `governance`               | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/governance`   | `["syntheticliability.com"]`                               | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/GovernanceLayerConcept"]`   | `Climate Jurisdiction frames governance authority over environmental intervention systems, linking identity and accountability within planetary-scale operations.`          | `Climate Jurisdiction`      | `氣候管轄權`   | `https://climatejurisdiction.com/`      | `A concept marker for examining how climate intervention, accountability, and resource decisions collide with borders, mandates, and enforcement.`                          | `概念標記：檢視氣候干預、問責與資源決策如何與疆界、授權與執行碰撞。`               | `climatejurisdiction`      | `["climateinterventionism.com","energyjurisdiction.com","strategicresourceresilience.com","protocolaccountability.com","orbitaljurisdiction.com","syntheticliability.com"]`          | `draft`  | `Existing page accepted; backfill JSON-LD to v3.1 later.`                                                                                       |
| `computationalsovereignty.com` | `sovereignty`  | `["computational"]`             | `sovereign_infrastructure` | `governance`    | `[]`         | `https://civilizationcaching.com/termsets/v1/sovereignty`  | `["algorithmicsovereignty.com"]`                           | `["https://civilizationcaching.com/types/IdentityConcept","https://civilizationcaching.com/types/SovereigntyLayerConcept"]`  | `Computational Sovereignty defines the authority over compute-based identity infrastructure, positioning processing power as a core element of digital self-determination.` | `Computational Sovereignty` | `算力主權`     | `https://computationalsovereignty.com/` | `A concept marker for examining how control over computation is becoming a jurisdictional and sovereign instrument across infrastructure, policy, and markets.`             | `概念標記：檢視對算力的控制如何逐漸成為跨越基礎設施、政策與市場的管轄與主權工具。` | `computationalsovereignty` | `["sovereigndigitalarchitecture.com","sovereignairesilience.com","computationalscarcity.com","algorithmicallocation.systems","algorithmicsovereignty.com","energyjurisdiction.com"]` | `draft`  | `Existing page accepted; backfill JSON-LD to v3.1 later.`                                                                                       |

## Phase Workflow and Gates (v3.1)

This section defines the operational workflow for the 12-site identity batch.
It is procedural only (phase boundaries, gates, and verification checkpoints).
Taxonomy, namespace, JSON-LD field semantics, and row-level quality rules remain defined in the
sections above.

### Phase 0: Baseline Snapshot (Required when pre-existing untracked site folders exist)

When the 12 site folders already exist as untracked directories, `git status --short` will often
collapse them to `?? <folder>/`, which is insufficient to prove no page drift occurred during
spec-phase.

Before spec-phase proceeds, capture a local baseline snapshot for the 12 `*/index.html` files.

Baseline manifest fields (minimum):

- relative path
- file size
- SHA256 hash

Baseline storage rules:

- Store the manifest under `_ops/` (gitignored).
- Baseline manifests are local-only and MUST NOT be committed.
- Baseline manifest filename SHOULD include a timestamp or batch label (for example
  `identity-batch-baseline-20260222.json` or `identity-batch-baseline.json`) to avoid accidental
  reuse across batches.

### Phase 1: Spec-Phase (Docs Only)

Hard gate (tracked file mutations):

- Allowed: `ops/**`
- Allowed: `RELATIONAL_LAYER.md`
- Forbidden: `*.html`
- Forbidden: `domains.json`
- Forbidden: `networklayer/markers.js`

Forbidden spec-phase actions:

- page copy edits
- inventory registration
- markers group registration
- implementation-phase artifact generation (redirects/sitemaps/robots) for publish intent

Phase-end verification:

1. Tracked diff allowlist passes (only allowed docs are modified tracked files).
2. Baseline hash comparison passes for the 12 site HTML files.

Commit hygiene (advisory):

- Spec-phase commits SHOULD be semantically scoped to taxonomy, namespace, schema, or workflow
  documentation.

### Phase 2: Draft Fill (12 Rows -> draft complete)

Hard gate:

1. All 12 rows exist in the locksheet.
2. All required fields are populated with format-correct values.
3. Array-like fields are persisted as arrays (not comma strings):
   - `subaxis`
   - `required_bridge_host`
   - `additionalType`
   - `intent_scope` (if present)
   - `related_links`
4. `inDefinedTermSet` matches the canonical format:
   - `https://civilizationcaching.com/termsets/v1/<set>`

Draft state hygiene (advisory):

- Draft-fill completion SHOULD be recorded by marking all rows with explicit `status = draft`,
  preventing implicit empty states.

### Phase 3: Site Lock (One Site at a Time)

Hard gate per site lock step:

1. Working tree preflight is clean before starting the lock step:
   - `git diff --name-only` MUST return no output.
   - `git status --porcelain` MUST return no output.
2. Only one row transitions to `locked`.
3. `identity_sentence` passes the v3.1 quality gate defined above.
4. `related_links` count is `4-6`.
5. `related_links` includes all `required_bridge_host` values.
6. Identity metadata is internally consistent:
   - `title_en`
   - `title_zh`
   - `canonical`
   - `data_marker`
   - descriptions
7. EN/ZH body copy is finalized for that site (even if HTML implementation is deferred).
8. No other row status changes occur in the same lock step unless the change is an explicit
   administrative correction.

Commit hygiene (advisory):

- Lock steps SHOULD be atomic commits scoped to a single site row unless the change is an explicit
  administrative correction.

### Phase 3 Addendum: Lock-Step `semantic_role` SOP (Frontmatter-Only)

This addendum standardizes `semantic_role` as a lock-step field in
`ops/site-copy/<slug>.md` YAML frontmatter.

Scope and guardrails:

- `semantic_role` is supplemental operational metadata and MUST NOT alter taxonomy.
- `semantic_role` MUST NOT change `concept_axis`, `subaxis`, `group_id`, or `inDefinedTermSet`.
- `ops/new-sites-locksheet.md` schema remains unchanged (no new columns).
- `semantic_role` is not a replacement for bridge-edge rules.

Deterministic mapping (derived from locksheet `concept_axis` at lock time):

| `concept_axis` | `semantic_role`        |
| -------------- | ---------------------- |
| `identity`     | `identity-anchor`      |
| `entity`       | `entity-container`     |
| `verification` | `trust-primitive`      |
| `governance`   | `governance-interface` |
| `sovereignty`  | `sovereignty-anchor`   |

Phase 3 lock-step SOP (delta):

1. Open `ops/site-copy/<slug>.md`.
2. Read `concept_axis` from the matching locksheet row (authoritative).
3. Check YAML frontmatter:
   - If `semantic_role` is missing, add it using the deterministic mapping above.
   - If `semantic_role` exists, validate it matches the deterministic mapping.
   - If mismatched, treat as a lock-step correction and fix before locking.
4. Do NOT modify `ops/new-sites-locksheet.md` schema or add columns.
5. Record pointer-only note in the locksheet `notes` cell:
   - `Semantic role: <role> (stored in ops/site-copy/<slug>.md frontmatter)`

Copy-file frontmatter field format (standardized):

```yaml
semantic_role: "trust-primitive"
```

Storage rules:

- YAML string (quoted recommended)
- lowercase kebab-case value
- SHOULD be present before marking the site lock step complete
- MUST be present on all `locked` `ops/site-copy/*.md` files
- MAY be omitted on `draft` `ops/site-copy/*.md` files

Manual audit rule (no code required yet):

For each `locked` site:

1. locksheet row `concept_axis` exists.
2. `ops/site-copy/<slug>.md` frontmatter contains `semantic_role`.
3. `semantic_role` matches the deterministic mapping.
4. locksheet `notes` includes the semantic-role pointer line.

Anchor-row note:

- `climatejurisdiction.com` (`concept_axis = governance`) maps to `governance-interface`.
- `computationalsovereignty.com` (`concept_axis = sovereignty`) maps to `sovereignty-anchor`.
- This does not conflict with "anchor row" wording elsewhere, which describes workflow role only.

### Phase 4: Implementation Phase (Batch, only after all rows are locked)

Entry condition (hard gate):

- All 12 rows are `locked`.

Allowed actions:

- batch HTML updates for the 12 sites
- `domains.json` registration
- `networklayer/markers.js` group registration
- artifact generation and audits

Prohibition:

- Implementation MUST NOT begin while any row remains `draft`.

Phase meaning:

- Implementation-phase represents the first public topology materialization of the identity batch.

### Verification Procedure (Phase-Aware)

Use this checklist to verify the correct gate at the correct phase.
This section documents procedure only; it does not define a new script.

1. Spec-phase tracked diff allowlist check
   - Verify tracked changes are limited to `ops/**` and `RELATIONAL_LAYER.md`.
2. Spec-phase baseline hash snapshot compare
   - Compare current hashes for the 12 `*/index.html` files against the `_ops/` baseline manifest.
   - Any mismatch is a spec-phase violation unless the work is intentionally reclassified as
     implementation-phase.
3. Draft-fill schema and format checks
   - Confirm all required fields are populated.
   - Confirm array-like fields are persisted as arrays.
   - Confirm `inDefinedTermSet` uses `https://civilizationcaching.com/termsets/v1/<set>`.
4. Per-site lock checks
   - Confirm working tree preflight is clean before each lock step:
     - `git diff --name-only` returns no output
     - `git status --porcelain` returns no output
   - Review the site row against the v3.1 row-level gates before setting `status = locked`.
5. Post-lock batch implementation checks
   - Run the batch generation, audit, and formatting checks defined by the implementation-phase
     workflow.

## Lock Rule (Batch Gate)

A row is considered `locked` only when all items below are finalized:

1. `concept_axis`
2. `subaxis` (if used) normalized to array
3. `group_id`
4. `identity_intent`
5. `inDefinedTermSet`
6. `required_bridge_host`
7. `additionalType`
8. `identity_sentence` passes quality gate
9. `title_en`, `title_zh`, `canonical`, `data_marker`, descriptions
10. `related_links` count is `4-6` and includes required bridge host(s)
11. EN/ZH page body copy finalized for the site

Inventory/topology updates (`domains.json`, `networklayer/markers.js`) are deferred until all 12
rows are `locked`.
