---
host: syntheticattestation.com
site_slug: syntheticattestation
status: locked
lock_order: 1

concept_axis: verification
subaxis: ["attestation", "synthetic"]
group_id: synthetic_systems
identity_intent: governance

canonical: https://syntheticattestation.com/
data_marker: syntheticattestation

in_defined_term_set: https://civilizationcaching.com/termsets/v1/verification
required_bridge_host: ["syntheticliability.com"]

# related_links MUST be 4-6 and MUST include required_bridge_host(s)
related_links:
  [
    "syntheticverification.com",
    "syntheticcertification.com",
    "protocolaccountability.com",
    "syntheticlegalentity.com",
    "syntheticliability.com",
  ]

title_en: Synthetic Attestation
title_zh: 合成鑑證

description_en: A concept marker for examining cryptographic and procedural assertions used to attest the integrity and provenance of synthetic agent identity states.
description_zh: 概念標記：檢視用於鑑證合成代理身份狀態完整性與來源的密碼學與程序性聲明。

# Identity sentence must pass v3.1 gates:
# - length 80-200
# - starts with JSON-LD name (Synthetic Attestation ...)
# - contains allowed verb token (e.g., provides)
# - contains governance/interoperability token (e.g., verification, governance, interoperability, accountability, infrastructure)
identity_sentence_en: "Synthetic Attestation provides cryptographic and procedural assertions that validate the integrity and provenance of artificial agent identity states, enabling verification across platforms and accountable governance."
identity_sentence_zh: "合成鑑證提供密碼學與程序性聲明，用以驗證人工代理身份狀態的完整性與來源，讓跨平台驗證與可問責治理成為可能。"

# semantic_role derived deterministically from concept_axis=verification
semantic_role: "trust-primitive"
trust_stack_layer: "attestation"
trust_stack_function: "assertion-generation"

bridge_body_evidence:
  en_paragraph_index: 6
  concept_tokens: ["verification", "liability"]
  relation_tokens: ["requires"]

copy_version: v1
---

## Identity Sentence

**EN:** Synthetic Attestation provides cryptographic and procedural assertions that validate the integrity and provenance of artificial agent identity states, enabling verification across platforms and accountable governance.

**ZH:** 合成鑑證提供密碼學與程序性聲明，用以驗證人工代理身份狀態的完整性與來源，讓跨平台驗證與可問責治理成為可能。

## Body Copy

### EN

- Synthetic Attestation names the assertion layer that binds an agent's claimed identity state to evidence that can be checked independently.
- It focuses on provenance, integrity, and replay resistance-so "who/what acted" can be separated from "what a platform claims."
- Attestation may be cryptographic, procedural, or hybrid, but it must remain portable across systems that do not share the same trust roots.
- In an identity stack, attestation is the point where raw signals become statements that can be evaluated, logged, and disputed.
- This node connects verification outcomes to governance decisions by making claims inspectable rather than implicit.
- The verification layer requires liability attribution to remain enforceable when identity actions cross organizational or jurisdictional boundaries.
- When a platform issues its own credentials, attestation provides the neutral evidence format that other systems can validate without adopting the issuer's worldview.
- Over time, consistent attestation patterns become the minimal trust primitive that supports interoperability for synthetic agents.

### ZH

- 合成鑑證指認一個「聲明層」，把代理所主張的身份狀態綁定到可被獨立檢驗的證據之上。
- 它聚焦於來源、完整性與重放抵抗，使「誰／什麼做了」能與「平台怎麼宣稱」分離。
- 鑑證可以是密碼學、程序性或混合式，但必須能在不同信任根與不同實作之間可攜帶。
- 在身份堆疊中，鑑證是讓原始訊號變成「可評估、可記錄、可爭議」聲明的轉換點。
- 這個節點把驗證結果接到治理決策上：讓主張可被檢視，而不是只存在於系統默示。
- 當身份行為跨越組織或司法邊界時，驗證層必須要求責任歸屬，否則就無法形成可執行的問責。
- 當每個平台都自行發行憑證時，鑑證提供一種中立的證據格式，讓其他系統不必接受發行者的世界觀也能驗證。
- 長期而言，穩定的鑑證模式會成為合成代理互通所需的最小信任原語。

## Lock Notes

- Locked as Phase 3 site-copy corpus v1 (docs-only).
- semantic_role derived from concept_axis=verification -> trust-primitive.
- Bridge evidence: EN paragraph 6 includes concept tokens (verification/liability) + relation token (requires).
