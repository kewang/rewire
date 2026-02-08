## Context

ESLint 報告 5 個問題（3 errors, 2 warnings），涉及 React hooks 規則違反。這些是技術債，需在下一次功能開發前清理。

## Goals / Non-Goals

**Goals:**
- 消除所有 ESLint errors 和 warnings，達到 `npm run lint` 零錯誤
- 不改變任何功能行為

**Non-Goals:**
- 不重構不相關的程式碼
- 不新增功能

## Decisions

### D1: CircuitDiagram render 中的 svgRef.current 存取

**問題：** L482-483 在 render body 中讀取 `svgRef.current` 來計算拖曳預覽 Y 座標。React 19 strict mode 禁止 render 期間存取 ref。

**方案：** 將 previewY 計算移入既有的 useEffect（L452，已經在做 cursor→circuit 判定），在同一個 effect 中計算 svgPt.y 並存入新的 state `previewY`。render body 直接讀取 state 值。

**理由：** 既有 effect 已在做完全相同的 svgRef + cursorPos 計算，只需額外產出 previewY 值，避免重複邏輯。

### D2: GameBoard tick 宣告順序

**問題：** `useEffect`（L157-163）在 `tick`（L105）宣告之前執行 `requestAnimationFrame(tick)`。雖然 runtime 因 hoisting 不會出錯，但 ESLint react-hooks/immutability 規則視為 error。

**方案：** 將 `useEffect` 移到 `tick` 宣告之後。

**理由：** 最小改動，只需剪貼移動位置。

### D3: GameBoard circuitConfigs useMemo

**問題：** `const circuitConfigs = currentLevel?.circuitConfigs ?? []` 每次 render 產生新陣列引用（`?? []`），導致下游 `useMemo` 的 deps 不穩定。

**方案：** 提取一個模組級常數 `EMPTY_CONFIGS: CircuitConfig[] = []` 用於 fallback，確保引用穩定。

**理由：** 比包裹 useMemo 更簡潔，零額外 hook 開銷。

## Risks / Trade-offs

- 風險極低，均為局部重構，不改變功能邏輯
- D1 將 previewY 從同步計算改為 state，理論上多一幀延遲，但 effect 在每次 cursorPos 變化時觸發，實際不可感知
