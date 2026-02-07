## Context

StatusDisplay 背景為 `#111`（接近純黑），label 文字為 `#888`，value 文字未設定顏色。在截圖中可見數值不易閱讀。

## Goals / Non-Goals

**Goals:**
- 讓 status-label 和 status-value 在深色背景上清晰可讀
- 達到 WCAG AA 標準（4.5:1 對比度）

**Non-Goals:**
- 不改變整體深色主題風格
- 不重新設計版面配置

## Decisions

### Decision 1: 配色調整

- `status-label`：從 `#888` 改為 `#aaa`（對比度 ~7.2:1 vs `#111`）
- `status-value`：明確設定為 `#f0f0f0`（對比度 ~15:1 vs `#111`）

保持深色面板風格，僅提升文字亮度。

## Risks / Trade-offs

- **已有 inline style 顏色的值（狀態、成本）不受影響** → 這些 inline 顏色（綠 `#22c55e`、黃 `#eab308`、紅 `#ef4444`）在 `#111` 背景上對比度本身就足夠。
