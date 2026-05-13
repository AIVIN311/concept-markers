Phase 3 慢速鎖站 SOP（v1.0）

📌 狀態註記（2026-04-09）
• Phase 3 slow-lock cadence 已完成。
• 最終收尾 receipt 見 `ops/PHASE3_CLOSEOUT.md`。
• legacy `lockedsyntheticlegalentity` 處理不屬於本 SOP，需單獨立 policy。

⸻

🎯 原則（不動搖）1. Append-only：不改寫歷史（不 rebase / amend）。2. Ops-only：只動 ops/ 允許清單。3. 最小差異：只做必要變更（鎖行 + 必要 placeholder / 格式修復）。4. 可驗證：每一步都有硬檢查。5. 可回滾：單站單 commit（atomic）。

⸻

📦 允許變更清單（白名單）
• ops/trust-trio-locksheet.md
• ops/site-copy/<domain>.md（若缺才建 3 行 placeholder）
• 純格式修復（如 EOF LF），僅限白名單檔案

❌ 不動 index.html / domains.json / networklayer/\* / runtime

⸻

🚦 Gate 0（開始前）

git status -sb
git diff --cached --name-only
git diff --name-only

通過條件：
• 無 staged
• 無 tracked modifications
• 無可疑 ??（尤其 ops/ 以外）

不通過 → 停止。

⸻

🧩 單站流程（每站最多 1 commit）

1. 前置確認
   • <domain>/index.html 存在
   • locksheet 查重（硬規則）：
   • 只認整行：^<domain>: locked$

2. 必要動作
   • 若 lock 行不存在 → 在 EOF append：

<domain>: locked

    •	若 ops/site-copy/<domain>.md 缺失 → 建立 3 行：

# <domain>

Placeholder site-copy for Phase 3 slow-lock cadence.
Source: <domain>/index.html (no content rewrite)

3. 格式契約（如需要）
   • 檔尾必須 LF（endsWithLF=True）
   • 不允許 CRLF（CR=0）
   • 不得變更任何字詞 / key / 排序

4. Stage 驗證

git add <white-listed-files>
git diff --cached --name-only

必須只出現白名單檔案。

5. Commit
   • 有 site-copy：

locksite(<domain>): lock + site-copy placeholder

    •	僅 lock 行：

locksite(<domain>): mark as locked

    •	純格式：

chore(ops): normalize EOF newlines

⸻

🔁 站與站之間 Gate

重跑 Gate 0。
若不乾淨 → 停止。

⸻

🔎 推送前檢查

git log --oneline origin/main..HEAD
git diff origin/main..HEAD -- <white-listed-files>
git status -sb

預期：
• commit 數量符合預期
• diff 僅為鎖行 / placeholder / 格式
• main...origin/main [ahead N]

⸻

🚀 推送

git push origin main

⸻

📊 推送後確認

git status -sb

預期：

## main...origin/main

（不再 ahead）

⸻

🧪 硬檢查（建議）

git diff --check
npm run markers:audit:strict

    •	audit 必須 mismatch 0
    •	format:check 若失敗，需標示為既有基線問題

⸻

🧾 回報模板（Receipt）

## Phase 3 Lock Report

今日鎖定：

- Site X: <domain>
- Site Y: <domain>

Commit：

- <sha> locksite(...)
- <sha> locksite(...)
- <sha> chore(ops): normalize EOF newlines（如有）

驗證：

- word-diff：無語義變化
- diff --check：通過
- audit:strict：mismatch 0
- locked count = X / 67

推送：

- push 成功
- main 與 origin 對齊

⸻

🔙 回滾
• 撤回最後一筆：

git revert --no-edit <sha>
git push origin main

    •	撤回整批：

git revert --no-edit <start_sha>^..HEAD
git push origin main

⸻

🧠 節奏守則（重要）
• 一天最多 2 站
• 每站最多 1 commit
• 不順手優化
• 不順手正規化 key
• 不順手 prettify 全 repo

⸻

如果你照這個 SOP 跑，
Phase 3 會變成：

穩定、可預測、可審計的文明帳本更新節奏。
