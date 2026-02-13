## 1. GameBoard overlay 元件 lazy-load

- [x] 1.1 將 PanelInteriorView import 改為 React.lazy，渲染處包裹 `<Suspense fallback={null}>`
- [x] 1.2 將 CrimpMiniGame import 改為 React.lazy，渲染處包裹 `<Suspense fallback={null}>`
- [x] 1.3 將 RoutingStrategyPicker import 改為 React.lazy，渲染處包裹 `<Suspense fallback={null}>`

## 2. CircuitDiagram lazy-load

- [x] 2.1 將 CircuitDiagram import 改為 React.lazy，渲染處包裹 `<Suspense>` 附輕量 loading spinner fallback

## 3. 子元件內部 lazy-load

- [x] 3.1 在 ResultPanel.tsx 中將 BeforeAfterView import 改為 React.lazy，包裹 `<Suspense fallback={null}>`
- [x] 3.2 在 CircuitDiagram.tsx 中將 BreakerSelector import 改為 React.lazy，包裹 `<Suspense fallback={null}>`

## 4. FloorPlanPreview 生產環境排除

- [x] 4.1 在 GameBoard.tsx 中用 `import.meta.env.DEV` 條件 guard FloorPlanPreview 的 import 和渲染

## 5. 驗證

- [x] 5.1 執行 `npm run build` 確認初始 JS chunk < 350 KB，且產出多個 async chunk
- [x] 5.2 執行 `npm run lint` 確認零 error/warning
- [x] 5.3 執行 `npm run test` 確認既有測試全部通過
