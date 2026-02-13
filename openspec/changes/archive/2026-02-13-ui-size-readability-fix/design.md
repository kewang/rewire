## Context

Agent-browser 審計發現多個 UI 元素的字體大小和觸控目標低於可讀性/操作性標準。問題集中在：
1. FloorPlanView SVG 內文字（房間名、電器 badge）過小
2. WireToolbar 線材規格文字過小
3. 按鈕（送電/返回）觸控目標過小
4. 關卡卡片描述、狀態面板標籤字體偏小
5. 手機版 header 排版擁擠

目前字體與目標大小對照：
| 元素 | 目前 | 目標 |
|------|------|------|
| FloorPlan 房間名 | 12px | 14px |
| FloorPlan 電器 badge | 9px | 12px |
| WireToolbar gauge | 12.8px (0.8rem) | 14px (0.875rem) |
| WireToolbar spec/cost | 11.52px (0.72rem) | 12.8px (0.8rem) |
| card-detail | 13.12px (0.82rem) | 14px (0.875rem) |
| status-label | 13.12px (0.82rem) | 14px (0.875rem) |
| 返回按鈕 | 13.12px, pad 8/16 | 14px, pad 10/20, min-h 40px |
| 送電按鈕 | 13.6px, pad 4/12 | 14px, pad 8/16, min-h 40px |

## Goals / Non-Goals

**Goals:**
- 所有遊戲內文字達到最小 12px（SVG）/ 13px（HTML）可讀門檻
- 主要按鈕觸控目標 ≥ 40px（接近 WCAG 44px 建議）
- 手機版 planner 模式不遮蔽平面圖主要內容
- 手機版 header 不過度換行

**Non-Goals:**
- 不重新設計 layout 架構
- 不更動遊戲邏輯或資料模型
- 不新增 CSS 變數（使用既有變數系統）
- 不處理 PWA / A11y 深化功能

## Decisions

1. **FloorPlanView SVG 文字**：在 TSX 中調整 inline font-size 屬性。房間名 fontSize 常數化 `ROOM_NAME_FONT_SIZE = 14`，電器 badge `BADGE_FONT_SIZE = 12`。
2. **WireToolbar CSS**：調整 `.wire-toolbar__gauge` 從 0.8rem → 0.875rem，`.wire-toolbar__spec` / `.wire-toolbar__cost` 從 0.72rem → 0.8rem。
3. **按鈕大小**：透過 CSS 調整 `.fp-power-button`（送電）和 `.back-button`（返回）的 padding 和 min-height，不用改 TSX。
4. **關卡卡片 / 狀態面板**：CSS font-size 微調。
5. **手機版 sidebar**：確認 `CircuitPlannerSidebar` 的 mobile auto-collapse 邏輯正常運作；若 sidebar 展開時用 overlay + backdrop 而非佔據 flex space。
6. **手機版 header**：調整 `.game-header` mobile breakpoint 下的 flex-wrap 和 gap，讓標題不被擠壓換行。

## Risks / Trade-offs

- 放大文字可能導致某些邊界情況下文字溢出（如長房間名在小 SVG）→ 使用 textAnchor="middle" 居中 + 必要時縮短
- WireToolbar 放大後手機上可能需要更多水平滾動 → 可接受，已有 scroll 機制
- 送電按鈕放大後可能影響 WireToolbar 右側空間 → 調整 flex 分配
