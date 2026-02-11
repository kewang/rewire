## Context

OpenSpec skills（10 個 `openspec-*`）和 commands（10 個 `opsx/*`）目前放在 rewire 專案的 `.claude/skills/` 和 `.claude/commands/`。這些檔案內容完全通用，沒有任何 rewire 專案專屬的路徑或邏輯。其他專案也需要使用同樣的 OpenSpec 工作流程。

Claude Code 支援 global skills/commands，放在 `~/.claude/skills/` 和 `~/.claude/commands/` 即可跨專案共用。

## Goals / Non-Goals

**Goals:**
- 將 OpenSpec skills 和 commands 搬至 global 位置，所有專案可共用
- 清除 rewire 專案內的 OpenSpec skills/commands 副本，避免重複

**Non-Goals:**
- 不修改 skill/command 內容（已確認完全通用）
- 不搬移 `frontend-design` skill（屬於 rewire 專案專屬）
- 不修改 `openspec/` 資料目錄結構（那是每個專案各自的）

## Decisions

1. **直接搬移，不修改內容** — 經逐一檢查，所有 OpenSpec skill/command 檔案無 rewire 專屬引用，可原封不動搬移。
2. **保留 `frontend-design` 在專案層級** — 該 skill 為 rewire UI 設計專用，不適合 global 化。
3. **刪除專案副本** — 避免 global 和 project 同名 skill 的優先級混淆。

## Risks / Trade-offs

- **[風險] global 位置不在 git 追蹤** → 需手動備份或在其他機器重新設定。可接受，因為 OpenSpec CLI 工具本身可重新產生這些檔案。
- **[風險] 同名 skill 優先級** → Claude Code 優先載入 project > global。刪除專案副本後不會衝突。
