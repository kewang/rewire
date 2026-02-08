## 1. 型別與狀態基礎

- [x] 1.1 在 `src/types/game.ts` 新增 `WiringState` 介面（isDragging, dragWire, cursorPos, isWired, connectedWire）
- [x] 1.2 在 `GameBoard.tsx` 新增 `wiringState` 狀態管理，包含初始值與更新函式

## 2. WireSelector 拖曳來源

- [x] 2.1 WireSelector 加入 pointer events（pointerdown/pointermove/pointerup）啟動拖曳
- [x] 2.2 實作觸控長按 150ms 閾值判定，區分拖曳與捲動
- [x] 2.3 拖曳中線材卡片顯示半透明視覺提示，游標變為抓取狀態
- [x] 2.4 送電中禁用拖曳（disabled 時不觸發 pointer events）

## 3. CircuitDiagram 放置目標

- [x] 3.1 CircuitDiagram 新增 drop zone 邏輯：偵測拖曳中的游標進入/離開 SVG 區域
- [x] 3.2 拖曳進入時插座區域顯示高亮發光邊框
- [x] 3.3 拖曳中即時渲染虛線預覽路徑（NFB 底部到游標位置）
- [x] 3.4 拖曳放置成功：虛線轉實線 + 接點閃光動畫
- [x] 3.5 未接線時顯示灰色虛線佔位符 + 提示文字「拖曳線材到此處接線」

## 4. GameBoard 整合

- [x] 4.1 接線狀態驅動送電條件：未接線時 NFB 開關禁用，顯示「請先接線」提示
- [x] 4.2 接線完成後更新 `selectedWire` 為已連接的線材
- [x] 4.3 替換線材：拖入新線材時覆蓋舊接線，更新電路圖與成本
- [x] 4.4 重試/返回時重置接線狀態（isWired = false）

## 5. 樣式與響應式

- [x] 5.1 新增拖曳相關 CSS：游標樣式、拖曳中卡片半透明、drop zone 高亮
- [x] 5.2 SVG 虛線/實線轉場動畫 CSS（stroke-dasharray transition）
- [x] 5.3 接點閃光 CSS animation
- [x] 5.4 確保行動裝置觸控拖曳正常運作（touch-action: none、防捲動）
