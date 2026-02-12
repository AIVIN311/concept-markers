# Civilization Radar - Relational Layer v1.0

## Purpose

This document defines the relational architecture of the active concept-network domains.
It does not classify content by topic.
It specifies how authority, allocation, synthetic stability, identity, infrastructure, and
civilizational horizon interact as a structural topology.

中文摘要：
本文件定義的是關係層架構，不是主題分類。
它描述權力、分配、合成穩定、身份資料、基礎設施與文明地平線如何形成可維護的結構拓撲。

## Structural Axes

Each axis uses the same template: mapped group id, core nodes, structural function, and a
short Chinese summary. The node lists below are core samples rather than a full domain dump.

### 1. Governance & Legitimacy Axis

Mapped group id: `governance`

Core nodes:

- `algorithmiclegitimacy.com`
- `algorithmiclegitimacy.ai`
- `algorithmicmartiallaw.com`
- `algorithmicsovereignty.com`
- `algorithmicenforcement.com`
- `automatedjurisprudence.com`
- `syntheticjurisdiction.com`
- `jurisdictionaldrift.com`
- `defaultpower.com`
- `thepowerofdefault.com`

Structural function:
Defines how authority is conferred, normalized, and automated through procedure, defaults, and
enforcement pathways.

中文摘要：
此軸線處理權力如何在未明示狀態下形成與擴張，包含正當性、程序權威與慢性管轄漂移。

### 2. Allocation & Control Axis

Mapped group id: `monetary_infrastructure`

Core nodes:

- `algorithmicallocation.com`
- `algorithmicallocation.ai`
- `algorithmicallocation.systems`
- `algorithmicreserves.com`
- `postfiatreservesystems.com`
- `energyjurisdiction.com`
- `strategicresourceresilience.com`
- `computationalscarcity.com`
- `aurumreserveprotocol.com`

Structural function:
Defines how access, eligibility, prioritization, and scarcity are executed through allocation and
control mechanisms.

中文摘要：
此軸線定義誰可進入、誰被延後、誰被拒絕，屬於權力的落地分配層。

### 3. Synthetic Systems Axis

Mapped group id: `synthetic_systems`

Core nodes:

- `syntheticsolvency.com`
- `syntheticsolvency.ai`
- `syntheticliability.com`
- `volatilityasinfrastructure.com` (bridge, primary markers group: `monetary_infrastructure`)
- `syntheticpollution.com`
- `syntheticrealitycrisis.com`
- `siliconmetabolism.com`
- `modelautophagy.com`

Structural function:
Defines model-mediated stability, where solvency, risk, and structural continuity are computed
rather than materially anchored.

中文摘要：
此軸線描述模型化制度如何維持穩定，讓可償付與風險管理成為持續重算結果。

### 4. Identity & Cognitive Substrate

Mapped group id: `identity_data`

Core nodes:

- `biologicaldatacenter.com`
- `biometricsovereignty.com`
- `biometricliability.com`
- `organicdatarights.com`
- `cognitiveassetclass.com`
- `posthumousidentity.com`
- `posttruthresilience.com`
- `humanintelligenceisirreplaceable.com` (bridge, primary markers group: `civilization`)

Structural function:
Defines boundary conditions for personhood, identity continuity, data claims, and cognitive-value
representation.

中文摘要：
此軸線處理個體何時被視為資料、責任或資產，以及認知主權的邊界。

### 5. Sovereign Infrastructure Axis

Mapped group id: `sovereign_infrastructure`

Core nodes:

- `sovereigndigitalarchitecture.com`
- `sovereignairesilience.com`
- `energyjurisdiction.com` (bridge, primary markers group: `monetary_infrastructure`)

Structural function:
Defines the substrate layer where sovereignty is implemented through architectural and operational
infrastructure.

中文摘要：
此軸線不是現象描述，而是承載層，定義權力在何種基礎設施上運行。

### 6. Civilization Horizon Axis

Mapped group id: `civilization`

Core nodes:

- `civilizationcaching.com`
- `civilizationprotocols.com`
- `lunarresourceprotocol.com`
- `offworldsovereignty.com`
- `offworldassetrights.com`
- `orbitallockdown.com`
- `theageoffusion.com`
- `thefirstmarscitizen.com`
- `thefutureisalreadyhereitisjustnotevenlydistributed.com`
- `thepacificpivot.com`

Structural function:
Defines long-arc transition patterns across planetary, offworld, and civilizational coordination
horizons.

中文摘要：
此軸線描述文明長時段演化與地平線擴張，關注延續性與尺度轉換。

## Mirror Architecture

Layer definition:

- `.com` = Concept Origin Layer
- `.ai` = Inference / Model Layer
- `.systems` = Control / Implementation Layer

Fixed example:

- `algorithmicallocation.com` names the phenomenon.
- `algorithmicallocation.ai` models eligibility, scoring, and inference order.
- `algorithmicallocation.systems` encodes quotas, schedulers, and operational gates.

## Bridge Nodes

Bridge nodes:

- `defaultpower.com`
- `jurisdictionaldrift.com`
- `volatilityasinfrastructure.com`
- `computationalscarcity.com`
- `strategicresourceresilience.com`

Bridge policy:
Bridge density is intentionally limited to preserve topological clarity and prevent link sprawl.

## Closest Links Topology Rules

1. Mirror-first invariant

- `.ai` and `.systems` list `.com` first.
- `.com` lists mirrors first when both exist.

2. Control-tier second

- Procedural, enforcement, or default-power neighbors follow mirror links.

3. Cross-axis bridge third

- Add only 1-2 intentional bridge neighbors after mirror and control tiers.

4. Pruning discipline

- `.ai/.systems` pages keep 3 neighbors.
- `.com` pages keep 4-6 neighbors.

## Network Philosophy

This network does not provide services, policy prescriptions, or operational automation tools.
It marks structural conditions and relationship gradients.
Nodes are designed to remain coherent as a distributed reference system, not as isolated pages.

## Bridge Exceptions Registry

These bridge nodes are intentionally listed under narrative axes while retaining a different
primary group in `networklayer/markers.js`.

- `energyjurisdiction.com`
  - narrative axis: Sovereign Infrastructure Axis
  - primary markers group: `monetary_infrastructure`
- `volatilityasinfrastructure.com`
  - narrative axis: Synthetic Systems Axis
  - primary markers group: `monetary_infrastructure`
- `humanintelligenceisirreplaceable.com`
  - narrative axis: Identity & Cognitive Substrate
  - primary markers group: `civilization`

## Maintenance Contract

1. Source of truth for topology is `networklayer/markers.js` group mapping.
2. `RELATIONAL_LAYER.md` lists representative core nodes, not the full domain inventory.
3. When topology changes, update this document only if axis meaning, bridge logic, or mirror rules
   change materially.
4. Keep mirror semantics stable: `.com` origin, `.ai` inference, `.systems` implementation.
5. Keep topology rules deterministic and metadata-driven; avoid ad-hoc link expansion.
6. Keep README as an entrypoint summary and keep this file as the full relational specification.
7. Versioning default is `v1.0`; bump version only when structural rules or axis definitions change.
