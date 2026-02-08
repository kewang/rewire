## Why

ESLint 報告 3 個 error 和 2 個 warning，涉及 React hooks 規則違反（render 中存取 ref、變數宣告前存取、useMemo 依賴不穩定）。這些問題可能導致 React 19 strict mode 下的非預期行為。

## What Changes

- 修復 `CircuitDiagram.tsx` render 期間存取 `svgRef.current` 的問題（改用 state 或 effect 追蹤 SVG 座標）
- 修復 `GameBoard.tsx` 中 `tick` 函式在宣告前被 `useEffect` 引用的問題（調整宣告順序）
- 修復 `GameBoard.tsx` 中 `circuitConfigs` 邏輯表達式導致 `useMemo` 依賴每次 render 變化的問題（包裹為 `useMemo`）

## Capabilities

### New Capabilities

（無新功能）

### Modified Capabilities

（無 spec 層級變更，僅修復實作層面的 React hooks 規則違反）

## Impact

- `src/components/CircuitDiagram.tsx` — 拖曳預覽 Y 座標計算邏輯
- `src/components/GameBoard.tsx` — rAF loop 初始化順序、circuitConfigs memo 化
