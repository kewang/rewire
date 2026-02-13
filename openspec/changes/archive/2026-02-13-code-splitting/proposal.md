## Why

目前整個應用打包為單一 JS chunk（531 KB），Vite 已發出 chunk 過大警告。許多元件只在特定遊戲階段或特定關卡類型才使用（走線面板、壓接小遊戲、走線策略選擇器等），但它們全部包含在初始 bundle 中，拖慢首屏載入。PRD v0.10 FR-L-A 要求初始 JS chunk < 350 KB。

## What Changes

- 將 6 個條件渲染的重型元件改為 `React.lazy()` + `Suspense` 延遲載入：
  - `PanelInteriorView`（885 行）— 僅走線整理 overlay 使用
  - `CircuitDiagram`（887 行）— 僅 legacy layout 使用（與 FloorPlanView 互斥）
  - `CrimpMiniGame`（268 行）— 僅壓接關卡 overlay 使用
  - `RoutingStrategyPicker`（116 行）— 僅平面圖走線策略選擇使用
  - `BeforeAfterView`（117 行）— 僅老屋通關結果使用
  - `BreakerSelector`（112 行）— 僅老屋 NFB 更換 popup 使用
- `FloorPlanPreview` 在生產 build 中排除（開發驗證用元件）
- 為延遲載入元件提供統一的 Suspense fallback（輕量 spinner/skeleton）

## Capabilities

### New Capabilities
- `lazy-loading`: React.lazy + Suspense 延遲載入架構，包含 fallback UI 與生產環境排除邏輯

### Modified Capabilities
（無既有 spec 的需求級變更）

## Impact

- `src/components/GameBoard.tsx` — 6 個 import 改為 React.lazy，渲染處包裹 Suspense
- `src/components/ResultPanel.tsx` — BeforeAfterView import 改為 React.lazy
- `src/components/CircuitDiagram.tsx` — BreakerSelector import 改為 React.lazy
- `src/App.tsx` — 可能需要頂層 Suspense boundary
- Vite build 輸出從單一 chunk 變為 main chunk + 多個 async chunk
- 預期初始 chunk 從 531 KB 降至 < 350 KB
