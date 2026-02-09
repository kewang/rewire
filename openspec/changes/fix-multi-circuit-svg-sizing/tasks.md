## 1. SVG 多行排列

- [x] 1.1 在 CircuitDiagram.tsx 新增 MAX_CIRCUITS_PER_ROW 常數（=4）和 ROW_GAP 常數
- [x] 1.2 修改 svgWidth/svgHeight 計算：寬度 = min(n, MAX_PER_ROW) × CIRCUIT_WIDTH，高度依行數動態調整
- [x] 1.3 修改 SingleCircuitSVG 的 translate 座標：x = (i % MAX_PER_ROW) × CIRCUIT_WIDTH，y = floor(i / MAX_PER_ROW) × (CIRCUIT_HEIGHT + ROW_GAP)
- [x] 1.4 修改 SVG maxWidth：改為 min(n, MAX_PER_ROW) × 260
- [x] 1.5 修改拖曳 drop zone 的 circuitIndex 計算，支援多行（svgX + svgY → row + col → index）

## 2. CSS 佈局修正

- [x] 2.1 在 GameBoard 中，當 circuitConfigs.length ≥ 4 時加上 `many-circuits` CSS class
- [x] 2.2 在 App.css 新增 `.game-board.many-circuits .game-main` 規則，桌面版改為 flex column 堆疊

## 3. 驗證

- [x] 3.1 Build + lint 通過無錯誤
