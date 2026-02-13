## Why

Agent-browser UI 審計發現多處文字和互動元素過小，影響可讀性和操作性。平面圖 SVG 電器 badge 僅 9px、線材工具列規格文字 11.52px、房間名稱 12px，在手機上幾乎無法閱讀。送電/返回按鈕觸控目標未達 WCAG 2.1 AA 建議的 44px 最小尺寸。手機版 planner sidebar 展開時佔據 ~75% 寬度，平面圖被擠成窄條。

## What Changes

- 平面圖 SVG 文字放大：房間名稱 12→14px、電器 badge 9→12px
- 線材工具列文字放大：gauge 12.8→14px、spec/cost 11.52→13px
- 按鈕觸控目標增大：送電/返回按鈕 min-height 44px、padding 加大
- 關卡卡片描述字體放大：card-detail 13.12→14px
- 狀態面板標籤字體放大：status-label 13.12→14px
- 手機版 header 排版優化：減少換行擁擠
- 手機版 planner sidebar 預設收合行為確認與修復

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `floor-plan-renderer`: 放大 SVG 內文字元素（房間名、電器 badge）
- `wire-toolbar`: 放大線材規格文字
- `floor-plan-responsive`: 手機版 sidebar / header 排版優化

## Impact

- CSS 檔案：FloorPlanView.css、WireToolbar.css、LevelSelect.css、StatusDisplay.css、GameBoard.css、CircuitPlannerSidebar.css、App.css
- TSX 檔案：FloorPlanView.tsx（SVG inline font-size）
- 純視覺調整，不影響遊戲邏輯或資料模型
