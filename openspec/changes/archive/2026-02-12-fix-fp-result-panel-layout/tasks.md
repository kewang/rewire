## 1. GameBoard JSX 重構

- [x] 1.1 將 `overlays` 拆分為 `resultPanel`（ResultPanel JSX）和 `modalOverlays`（PanelInteriorView + RoutingStrategyPicker + CrimpMiniGame）
- [x] 1.2 fp-layout 分支：將 `resultPanel` 移入 `.fp-center` 內（FloorPlanView 下方、routing-button 下方），`modalOverlays` 保留在 `.fp-layout` 底部
- [x] 1.3 legacy 分支：將 `resultPanel` 和 `modalOverlays` 拼在原位，維持原行為

## 2. CSS 調整

- [x] 2.1 為 `.fp-center .floor-plan-view` 加上 `min-height: 40vh` 和 `flex-shrink: 0`，防止被壓縮
- [x] 2.2 確認 `.fp-center` 的 `overflow-y: auto` 在 ResultPanel 出現時可正常捲動

## 3. 驗證

- [x] 3.1 執行 `npm run lint` 確認零 error/warning
- [x] 3.2 執行 `npm run test` 確認既有測試通過
