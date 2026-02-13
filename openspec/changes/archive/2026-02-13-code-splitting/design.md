## Context

目前 Rewire 打包為單一 JS chunk（531 KB gzip 前），Vite 已發出 >500 KB 警告。分析顯示 GameBoard.tsx 直接 import 了 6 個僅在特定條件下渲染的重型元件，ResultPanel 內含 BeforeAfterView，CircuitDiagram 內含 BreakerSelector。這些元件加總約佔 bundle 40-50%，但首屏載入時完全不需要。

## Goals / Non-Goals

**Goals:**
- 初始 JS chunk < 350 KB（gzip 前）
- 延遲載入的元件在需要時無感載入（使用者不會看到明顯延遲）
- FloorPlanPreview 在生產 build 中完全排除
- 維持所有現有功能行為不變

**Non-Goals:**
- 不做路由層級的 code-splitting（遊戲為 SPA 單頁）
- 不引入 SSR 或 streaming
- 不做 CSS code-splitting（已由 CSS extraction 處理）
- 不做 vendor chunk 手動分割（交由 Vite/Rollup 自動處理）

## Decisions

### D1：使用 React.lazy + Suspense（非動態 import wrapper）

**選擇**：直接用 `React.lazy(() => import('./Component'))` + `<Suspense>`

**替代方案**：
- loadable-components 庫 — 功能更強但引入外部依賴，此專案不需要 SSR
- 手動 dynamic import + useState — 複雜度高且重造輪子

**理由**：React.lazy 是 React 19 內建方案，零依賴，與專案「不引入新庫」原則一致。

### D2：Suspense fallback 策略 — 分層

**選擇**：
- Overlay 類元件（CrimpMiniGame / PanelInteriorView / RoutingStrategyPicker / BreakerSelector）：無 fallback（`fallback={null}`），因為它們已有條件渲染控制，載入前不顯示任何東西是合理的
- 內容區元件（CircuitDiagram）：輕量 loading spinner fallback，因為它佔據主要視覺區域
- ResultPanel 內的 BeforeAfterView：`fallback={null}`，結果面板已顯示，修復對比延遲載入使用者不會注意

**理由**：overlay 元件的觸發通常在使用者操作後，此時 chunk 很可能已預載完成（Vite prefetch）。即使未預載，overlay 的「出現」本身就有短暫延遲的心理預期。

### D3：FloorPlanPreview 排除策略

**選擇**：用 `import.meta.env.DEV` 條件 guard，生產 build 時 tree-shake 移除。

**替代方案**：
- 完全刪除 — 會失去開發驗證工具
- 單獨的 dev route — 過度工程

**理由**：Vite 在生產 build 時會將 `import.meta.env.DEV` 替換為 `false`，dead code elimination 自動移除整個 import 和渲染邏輯。

### D4：lazy import 放置位置

**選擇**：
- GameBoard.tsx 內 lazy：PanelInteriorView, CircuitDiagram, CrimpMiniGame, RoutingStrategyPicker
- ResultPanel.tsx 內 lazy：BeforeAfterView
- CircuitDiagram.tsx 內 lazy：BreakerSelector
- GameBoard.tsx 內條件 import：FloorPlanPreview

**理由**：lazy import 放在最接近使用處的元件中，避免在上層元件不必要地引入 Suspense boundary。

## Risks / Trade-offs

**[首次觸發延遲]** → 使用者第一次觸發 overlay 時可能有 100-300ms 載入延遲。
→ 緩解：Vite 自動在 `<link rel="modulepreload">` 預載 async chunks；overlay 元件體積小，載入快。

**[網路斷線時載入失敗]** → 離線情境下 lazy chunk 載入失敗會 throw。
→ 緩解：ErrorBoundary 已就位（v0.10 error-boundary），會攔截並顯示 fallback UI。未來 PWA service worker 會快取所有 chunks。

**[開發體驗]** → 開發環境不做 code-splitting（Vite dev 用 ESM），行為差異。
→ 緩解：這是 Vite 的標準行為，production build 測試即可確認。
