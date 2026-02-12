## Why

FloorPlanView 已完成靜態渲染與接線互動（Change 1-4），但遊戲核心的「送電模擬」尚未與平面圖整合。目前送電後的視覺回饋（過載/燒毀/跳脫）仍只在 CircuitDiagram 上呈現，平面圖模式下玩家無法看到模擬狀態。需要將模擬引擎的即時狀態傳入 FloorPlanView，並新增送電動畫（電流流動、房間亮/暗、路徑變色），讓平面圖成為完整的遊戲主視圖。

## What Changes

- **FloorPlanView 接收模擬狀態**：新增 `circuitStates` prop，依據各迴路狀態（normal/warning/tripped/burned/elcb-tripped/leakage/main-tripped）即時更新房間填色與走線路徑顏色
- **送電動畫**：送電後沿走線路徑繪製電流流動亮點動畫（SVG `<animate>` / CSS keyframes），從配電箱往各房間流動
- **房間狀態視覺**：送電中房間亮起（glow 效果）、問題迴路房間閃紅/暗掉、主開關跳脫全暗
- **走線路徑狀態色**：normal=線徑色 → warning=橘色漸變 → burned=紅色+斷裂 → tripped/elcb-tripped=灰色熄滅
- **送電按鈕整合**：平面圖模式下送電按鈕 (NFB lever) 置於底部工具列，canPowerOn 條件與現有邏輯一致
- **StatusDisplay 整合**：平面圖模式下 StatusDisplay 顯示精簡摘要（多迴路狀態 + 倒數計時 + 成本）
- **老屋問題在平面圖上顯示**：問題迴路的房間顯示 ⚠️ 閃爍 + 問題類型提示

## Capabilities

### New Capabilities
- `floor-plan-simulation-visual`: 平面圖上的模擬狀態視覺回饋（房間亮/暗、路徑變色、電流流動動畫、問題指示）

### Modified Capabilities
- `floor-plan-renderer`: 新增模擬狀態相關 props（circuitStates、isPowered、problemCircuits）與對應渲染邏輯
- `game-ui`: 平面圖模式下的 UI 佈局調整（送電按鈕位置、StatusDisplay 精簡模式）

## Impact

- **FloorPlanView.tsx** — 大幅擴充：新增模擬狀態 props、房間/路徑狀態著色、電流流動動畫 SVG
- **GameBoard.tsx** — 傳遞 multiState/isPowered/problemCircuits 到 FloorPlanView
- **App.css** — 新增平面圖動畫 keyframes（電流流動、房間閃爍、路徑漸變）
- **StatusDisplay.tsx** — 可能微調：平面圖模式下的精簡顯示
- **無新依賴** — 純 SVG + CSS 動畫，不引入外部動畫庫
