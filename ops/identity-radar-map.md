# Identity Radar Map (Synthetic Identity Infrastructure Stack)

This document defines the operational mapping for the 12-site Synthetic Identity Infrastructure
Stack.

It is an `ops/`-level frozen spec for:

- identity lifecycle spine
- locksheet mappings
- namespace policy
- JSON-LD identity contract
- bridge-edge audit rules

`RELATIONAL_LAYER.md` may summarize this stack, but operational details remain in `ops/`.

## Lifecycle Spine (Canonical)

`Personhood -> Entity -> Verification -> Governance -> Sovereignty`

This spine is the identity lifecycle backbone for the 12-site batch.

## Namespace Skeleton (Documented Families)

These families are reserved/documented for future publish/navigation structure.
They are not the canonical JSON-LD `inDefinedTermSet` format in v3.1.

- `https://civilizationcaching.com/axis/<name>`
- `https://civilizationcaching.com/layer/<name>`
- `https://civilizationcaching.com/cluster/<name>`

Examples:

- `https://civilizationcaching.com/axis/verification`
- `https://civilizationcaching.com/layer/governance`
- `https://civilizationcaching.com/cluster/identity_data`

## Canonical Termset URLs (JSON-LD `inDefinedTermSet`)

Use only `https://civilizationcaching.com/termsets/v1/<set>`:

- `https://civilizationcaching.com/termsets/v1/identity`
- `https://civilizationcaching.com/termsets/v1/entity`
- `https://civilizationcaching.com/termsets/v1/verification`
- `https://civilizationcaching.com/termsets/v1/governance`
- `https://civilizationcaching.com/termsets/v1/sovereignty`

Do not use `/termsets/<layer>/v1`.

## Taxonomy Contract (Spine + Subaxis)

### `concept_axis` (spine-only hard enum)

- `identity`
- `entity`
- `verification`
- `governance`
- `sovereignty`

### `subaxis` (optional specialization)

Use `subaxis` for specialization labels that should not fragment the spine taxonomy.
Examples include `jurisdiction`, `climate`, `orbital`, `personhood`, `attestation`.

## Cluster and Group Mapping (12-Site Batch)

### Batch Group Set (`group_id`)

- `identity_data`
- `governance`
- `synthetic_systems`
- `sovereign_infrastructure`

### Batch Intent Rule

- `identity` / `entity` axes -> `identity_intent = identity`
- `verification` / `governance` / `sovereignty` axes -> `identity_intent = governance`

## 12-Site Mapping Table (Locked v3.1)

| host                           | concept_axis   | subaxis                         | group_id (`data-series`)   | identity_intent | inDefinedTermSet                                           | required_bridge_host                                       |
| ------------------------------ | -------------- | ------------------------------- | -------------------------- | --------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| `hybridpersonhood.com`         | `identity`     | `["personhood","hybrid"]`       | `identity_data`            | `identity`      | `https://civilizationcaching.com/termsets/v1/identity`     | `["algorithmicsovereignty.com"]`                           |
| `offworldpersonhood.com`       | `identity`     | `["personhood","offworld"]`     | `identity_data`            | `identity`      | `https://civilizationcaching.com/termsets/v1/identity`     | `["algorithmicsovereignty.com"]`                           |
| `syntheticpersonhood.com`      | `identity`     | `["personhood","synthetic"]`    | `identity_data`            | `identity`      | `https://civilizationcaching.com/termsets/v1/identity`     | `["algorithmicsovereignty.com"]`                           |
| `syntheticlegalentity.com`     | `entity`       | `["legalentity","synthetic"]`   | `governance`               | `identity`      | `https://civilizationcaching.com/termsets/v1/entity`       | `["algorithmicsovereignty.com"]`                           |
| `syntheticcitizenship.com`     | `entity`       | `["citizenship","synthetic"]`   | `governance`               | `identity`      | `https://civilizationcaching.com/termsets/v1/entity`       | `["algorithmicsovereignty.com"]`                           |
| `syntheticattestation.com`     | `verification` | `["attestation","synthetic"]`   | `synthetic_systems`        | `governance`    | `https://civilizationcaching.com/termsets/v1/verification` | `["syntheticliability.com"]`                               |
| `syntheticverification.com`    | `verification` | `["verification","synthetic"]`  | `synthetic_systems`        | `governance`    | `https://civilizationcaching.com/termsets/v1/verification` | `["syntheticliability.com"]`                               |
| `syntheticcertification.com`   | `verification` | `["certification","synthetic"]` | `synthetic_systems`        | `governance`    | `https://civilizationcaching.com/termsets/v1/verification` | `["syntheticliability.com"]`                               |
| `protocolaccountability.com`   | `governance`   | `["protocol","accountability"]` | `governance`               | `governance`    | `https://civilizationcaching.com/termsets/v1/governance`   | `["jurisdictionaldrift.com","algorithmicsovereignty.com"]` |
| `orbitaljurisdiction.com`      | `governance`   | `["jurisdiction","orbital"]`    | `governance`               | `governance`    | `https://civilizationcaching.com/termsets/v1/governance`   | `["syntheticliability.com"]`                               |
| `climatejurisdiction.com`      | `governance`   | `["jurisdiction","climate"]`    | `governance`               | `governance`    | `https://civilizationcaching.com/termsets/v1/governance`   | `["syntheticliability.com"]`                               |
| `computationalsovereignty.com` | `sovereignty`  | `["computational"]`             | `sovereign_infrastructure` | `governance`    | `https://civilizationcaching.com/termsets/v1/sovereignty`  | `["algorithmicsovereignty.com"]`                           |

## Identity Sentence Seed Set (Machine-Readable Anchors)

These sentences are the canonical v3.1 seed set for locksheet `identity_sentence` and JSON-LD
`disambiguatingDescription`.

1. `hybridpersonhood.com`

- `Hybrid Personhood defines identity continuity across biological and synthetic substrates, establishing a framework for coexistence between human and artificial agents.`

2. `offworldpersonhood.com`

- `Offworld Personhood explores identity recognition beyond Earth jurisdiction, framing agent existence within extraterrestrial and orbital governance regimes.`

3. `syntheticpersonhood.com`

- `Synthetic Personhood formalizes the recognition of artificial agents as identity-bearing entities capable of participating in legal and social systems.`

4. `syntheticlegalentity.com`

- `Synthetic Legal Entity establishes a governance container through which artificial agents can hold rights, obligations, and operational accountability.`

5. `syntheticcitizenship.com`

- `Synthetic Citizenship defines membership status for artificial agents within political and institutional systems, enabling participation in sovereign structures.`

6. `syntheticattestation.com`

- `Synthetic Attestation provides cryptographic and procedural assertions that validate the integrity and provenance of artificial agent identity states.`

7. `syntheticverification.com`

- `Synthetic Verification ensures trust in artificial agents by enabling continuous validation of identity claims across platforms and jurisdictions.`

8. `syntheticcertification.com`

- `Synthetic Certification institutionalizes identity verification outcomes into recognized credentials that enable interoperability within governance ecosystems.`

9. `protocolaccountability.com`

- `Protocol Accountability defines enforceable responsibility within automated systems, ensuring that identity-linked actions remain auditable and governable.`

10. `orbitaljurisdiction.com`

- `Orbital Jurisdiction establishes governance boundaries for agents operating in space-based infrastructures, extending legal authority beyond terrestrial domains.`

11. `climatejurisdiction.com`

- `Climate Jurisdiction frames governance authority over environmental intervention systems, linking identity and accountability within planetary-scale operations.`

12. `computationalsovereignty.com`

- `Computational Sovereignty defines the authority over compute-based identity infrastructure, positioning processing power as a core element of digital self-determination.`

## JSON-LD Identity Contract (12-Site Batch)

### Required Fields

1. `@context`
2. `@type` = `DefinedTerm`
3. `name`
4. `alternateName`
5. `url`
6. `description`
7. `inDefinedTermSet`
8. `additionalType`
9. `disambiguatingDescription`

### `additionalType` Derivation (Deterministic)

`additionalType` MUST be an array of exactly 2 URLs:

1. Base type:
   - `https://civilizationcaching.com/types/IdentityConcept`
2. Layer type derived from `concept_axis`:

| `concept_axis` | Derived layer type                                               |
| -------------- | ---------------------------------------------------------------- |
| `identity`     | `https://civilizationcaching.com/types/IdentityLayerConcept`     |
| `entity`       | `https://civilizationcaching.com/types/EntityLayerConcept`       |
| `verification` | `https://civilizationcaching.com/types/VerificationLayerConcept` |
| `governance`   | `https://civilizationcaching.com/types/GovernanceLayerConcept`   |
| `sovereignty`  | `https://civilizationcaching.com/types/SovereigntyLayerConcept`  |

Audit must compute the second URL from `concept_axis` and reject mismatches.

### Standard Snippet Template (v3.1)

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "Synthetic Personhood",
  "alternateName": "合成人格",
  "url": "https://syntheticpersonhood.com/",
  "description": "A concept marker for examining how synthetic agents become identity-bearing entities within legal and social systems.",
  "inDefinedTermSet": "https://civilizationcaching.com/termsets/v1/identity",
  "additionalType": [
    "https://civilizationcaching.com/types/IdentityConcept",
    "https://civilizationcaching.com/types/IdentityLayerConcept"
  ],
  "disambiguatingDescription": "Synthetic Personhood formalizes the recognition of artificial agents as identity-bearing entities capable of participating in legal and social systems."
}
```

## Bridge-Edge Rule (Audit Spec v1, Pattern-Based)

### Metadata Bridge Gate (hard)

Every page MUST include all `required_bridge_host` values in `meta[name="related"]`.

Matching semantics:

- Case-insensitive host normalization
- Array semantics are AND
- Array order not significant
- Bare host or full URL accepted

Normalization rules:

1. lowercase
2. strip `http://` or `https://`
3. strip `www.`
4. strip path/query/fragment
5. trim trailing slash

v1 scope note:

- `punycode/IDN` is out of scope; this batch uses ASCII hosts only.

### Related Count Gate (hard)

- `meta[name="related"]` must contain `4-6` hosts
- Required bridge host(s) count toward the total

### EN Body Semantic Bridge Gate (hard, minimal-style safe)

At least one EN paragraph must satisfy both:

1. Contains one bridge concept token (case-insensitive), from:
   - `sovereignty`
   - `jurisdiction`
   - `liability`
   - `drift`
   - `accountability`
   - `verification`
   - `attestation`
   - `entity`
2. Contains one relation token (case-insensitive), from:
   - `depends on`
   - `requires`
   - `anchored by`
   - `enforceable`
   - `enforceable under`
   - `governed by`
   - `validated by`

No URL or hyperlink is required in body paragraphs.

### Special Case

`protocolaccountability.com` must include two bridge hosts:

- `jurisdictionaldrift.com`
- `algorithmicsovereignty.com`

## Operational Guardrail

This document is the frozen operational spec for the identity batch.
`RELATIONAL_LAYER.md` may provide summary/appendix references only and must not redefine:

- taxonomy values
- locksheet semantics
- bridge-edge rules
- JSON-LD field rules
