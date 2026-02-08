## 1. SVG 撥桿圖形

- [x] 1.1 在 CircuitDiagram 中將 NFB 矩形區域改為撥桿造型（軌道 + 把手 + 標籤），支援 ON/OFF 兩種視覺狀態
- [x] 1.2 實作禁用狀態外觀（半透明、cursor: not-allowed）：未接線或無電器時

## 2. 撥桿互動邏輯

- [x] 2.1 新增 CircuitDiagram 的 onPowerToggle callback prop，撥桿操作時呼叫
- [x] 2.2 實作點擊切換：pointerdown + pointerup 無明顯移動時切換 ON/OFF
- [x] 2.3 實作拖曳切換：pointerdown 在把手上 → 上下拖曳 → 超過閾值時切換狀態
- [x] 2.4 禁用狀態下忽略所有撥桿互動

## 3. 撥桿動畫

- [x] 3.1 加入 CSS transition 讓撥桿把手在 ON/OFF 之間平滑滑動（200-300ms）
- [x] 3.2 確認跳脫/燒毀時撥桿自然彈回 OFF（isPowered false → transition 觸發）

## 4. GameBoard 整合

- [x] 4.1 移除 GameBoard 中的獨立 NFB `<button>` 元素與 `.nfb-switch` 相關 JSX
- [x] 4.2 傳入 onPowerToggle prop 給 CircuitDiagram，連接既有 handlePowerToggle 邏輯
- [x] 4.3 傳入 disabled 條件（未接線或無電器且未送電）給 CircuitDiagram

## 5. 樣式清理

- [x] 5.1 移除 App.css 中 `.nfb-switch` 相關樣式
- [x] 5.2 新增撥桿相關 CSS（transition、hover 效果、禁用狀態）
