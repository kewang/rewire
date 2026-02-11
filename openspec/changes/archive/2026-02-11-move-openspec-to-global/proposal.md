## Why

OpenSpec skills 和 commands 目前放在專案層級 (`.claude/skills/openspec-*` 和 `.claude/commands/opsx/`)，僅限 rewire 專案可用。其他專案也需要使用 OpenSpec 工作流程，應搬到全域位置 (`~/.claude/`) 讓所有專案共用。

## What Changes

- 將 10 個 OpenSpec skills 從 `.claude/skills/openspec-*` 搬至 `~/.claude/skills/openspec-*`
- 將 10 個 opsx commands 從 `.claude/commands/opsx/` 搬至 `~/.claude/commands/opsx/`
- 刪除專案層級的 OpenSpec skills 和 commands（保留專案專屬的 `frontend-design` skill）

## Capabilities

### New Capabilities

（無新增 capability）

### Modified Capabilities

（無修改 capability — 此變更僅移動檔案位置，不影響任何功能規格）

## Impact

- `.claude/skills/openspec-*` — 刪除 10 個目錄（搬至 global）
- `.claude/commands/opsx/` — 刪除整個目錄（搬至 global）
- `.claude/skills/frontend-design/` — 保留不動（專案專屬）
- `~/.claude/skills/` 和 `~/.claude/commands/` — 不在 git 追蹤範圍，無需 commit
