## Why

v0.2 的線材選擇為點選卡片即時生效，缺乏實際「接線」的操作感。玩家無法體驗從線材捲拖線、連接 NFB 到插座的動手樂趣。拖拉接線是 v0.3 roadmap 的核心功能（FR-A），為後續多迴路（FR-B）奠定基礎。

## What Changes

- 新增拖拉接線互動：玩家從線材捲（WireSelector）拖曳線段到 CircuitDiagram 的 NFB → 插座路徑
- 拖曳過程中即時顯示 SVG 線段預覽（跟隨游標的虛線路徑）
- 線材放置到正確接點後確認連接，線段固定顯示在電路圖上
- 可替換線材：拖入新線段時舊線段消失、新線段接上
- 接線完成後才能送電（NFB 開關在未接線時禁用）
- 取消舊的點選卡片即時切換機制，改為拖拉操作
- 支援觸控裝置（touch events）以維持行動裝置可用性

## Capabilities

### New Capabilities
- `drag-drop-wiring`: 拖拉接線互動系統，涵蓋拖曳偵測、SVG 路徑預覽、接點碰撞偵測、線材放置確認

### Modified Capabilities
- `game-ui`: WireSelector 從點選切換改為拖曳起點；Power control 新增「未接線時禁用」前置條件；CircuitDiagram 新增接線狀態顯示
- `visual-feedback`: CircuitDiagram 需支援拖曳中的線段預覽、接點高亮、放置成功動畫

## Impact

- `src/components/WireSelector.tsx` — 改為拖曳來源（drag source），移除 onClick 選線邏輯
- `src/components/CircuitDiagram.tsx` — 新增 drop target 接點、拖曳預覽線段、已接線狀態顯示
- `src/components/GameBoard.tsx` — 新增 wiring state 管理（是否已接線、當前線材），修改送電前置條件
- `src/types/game.ts` — 可能新增 WiringState 型別
- `src/App.css` — 拖曳相關樣式（游標、預覽、高亮）
- 無新增外部依賴（使用原生 Drag & Drop API + pointer events）
