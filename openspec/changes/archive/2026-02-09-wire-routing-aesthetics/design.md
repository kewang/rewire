## Context

Change 1 (`panel-interior-view`) 建立了 PanelInteriorView SVG 元件（匯流排/走線區/NFB + 車道拖曳 + 交叉偵測）。此 change 補齊三塊：束帶工具 UI、整線評分引擎、GameBoard 流程整合。

現有架構要點：
- `PanelInteriorView` props: `{ circuitConfigs, circuitWires, phases, lanes, onLanesChange, onClose }`
- 交叉偵測已在 PanelInteriorView 內部完成（`detectCrossings` 函式）
- GameBoard 用 useState 管理 circuitWires/circuitCrimps/circuitPhases，rAF loop 驅動模擬
- `calcStars` 在 rAF loop 中 win condition 處呼叫，結果存入 `starResult` state
- CrimpMiniGame overlay 用 `pendingCrimpCircuitId` state 控制顯示/隱藏
- `canPowerOn` 條件門控送電按鈕

## Goals / Non-Goals

**Goals:**
- 束帶工具：PanelInteriorView 中相鄰車道間可點擊的放置點，toggle 放置/移除
- 整線評分引擎：`aesthetics.ts` 純函式，接收 crossings + cableTies + lanes 產出 0–100 分
- GameBoard 整線流程：routing phase 狀態、「整線」按鈕、overlay 控制、送電前置條件
- ResultPanel 整線分數顯示
- calcStars 預留 aestheticsScore 參數（但新 BonusCondition 類型留給 Change 3）

**Non-Goals:**
- 不新增 L21–L23 關卡（Change 3）
- 不新增 `aesthetics-score` BonusCondition 類型（Change 3）
- L01–L20 不受影響

## Decisions

### 1. 束帶狀態模型

束帶用 `Set<number>` 表示，number 為相鄰車道 pair 的 index（0 = lane[0]-lane[1] 之間，1 = lane[1]-lane[2]...）。

```tsx
// PanelInteriorView 新增 props
cableTies: Set<number>;
onToggleCableTie: (pairIndex: number) => void;
```

狀態由 GameBoard 管理（與 lanes 一起），PanelInteriorView 為受控元件。

**理由**：保持 PanelInteriorView 無狀態（純展示 + 回調），GameBoard 集中管理所有 routing 狀態。

### 2. 束帶放置點 UI

在走線區每對相鄰車道中間繪製可點擊區域：
- 無束帶 + 不交叉：淡黃色虛線提示 + hover 效果
- 已放束帶：綠色束帶圖示（兩條橫線環繞）
- 交叉：disabled（紅色半透明 + 禁止游標）

點擊回調 `onToggleCableTie(pairIndex)`，GameBoard 端 toggle Set。

### 3. 整線評分引擎

新增 `src/engine/aesthetics.ts`：

```ts
export function calcAestheticsScore(crossings: number, unbundledPairs: number): number {
  return Math.max(0, Math.min(100,
    100 - crossings * CROSSING_PENALTY - unbundledPairs * UNBUNDLED_PENALTY
  ));
}

export function countUnbundledPairs(lanes: string[], cableTies: Set<number>, crossingPairIndices: Set<number>): number {
  let count = 0;
  for (let i = 0; i < lanes.length - 1; i++) {
    if (!crossingPairIndices.has(i) && !cableTies.has(i)) count++;
  }
  return count;
}
```

常數加入 `constants.ts`：`CROSSING_PENALTY = 20`, `UNBUNDLED_PENALTY = 5`。

**理由**：純函式、無副作用，與 scoring.ts 風格一致。crossingPairIndices 由 PanelInteriorView 已有的 detectCrossings 衍生。

### 4. PanelInteriorView 即時分數顯示

擴充 score bar 區域，新增整線分數：

```
交叉數: 0   |   束帶: 2/3   |   整線分數: 90
```

分數由 PanelInteriorView 接收 props 計算（或由 GameBoard 計算後傳入）。選擇後者：GameBoard 計算分數傳入 `aestheticsScore` prop，保持一致性。

### 5. GameBoard 整線流程

新增 state：
- `circuitLanes: CircuitId[]` — 車道排列（初始值 = circuitConfigs.map(c => c.id)）
- `cableTies: Set<number>` — 束帶放置
- `routingCompleted: boolean` — 是否已完成整線
- `showRoutingOverlay: boolean` — 是否顯示 PanelInteriorView

流程：
1. 所有接線完成（+ 壓接 if requiresCrimp）且 `requiresRouting` → 顯示「整線」按鈕
2. 點「整線」→ `showRoutingOverlay = true`
3. PanelInteriorView overlay 操作（拖曳 + 束帶）
4. 點「完成整線」→ `showRoutingOverlay = false`, `routingCompleted = true`, 計算最終分數
5. 送電

`canPowerOn` 條件擴充：`&& (!level.requiresRouting || routingCompleted)`

### 6. 送電前置 leverTooltip 擴充

在 leverTooltip 鏈中加入：`!routingCompleted && level.requiresRouting ? '請先完成整線' : ...`

### 7. ResultPanel 整線分數

新增 optional prop `aestheticsScore?: number`。當有值時，在 result details 中顯示：

```
整線分數：90 / 100
```

樣式依分數著色：≥80 綠、≥50 黃、<50 紅。

### 8. calcStars 預留擴充

`CalcStarsInput` 新增 optional `aestheticsScore?: number`。目前不影響計算邏輯（Change 3 會新增 `aesthetics-score` BonusCondition 來使用此值）。

## Risks / Trade-offs

- **[束帶重置]** 拖曳車道後束帶可能失效（原本平行的線對交叉了）→ 拖曳後清除所有束帶，讓玩家重新放置。簡單且直覺。
- **[detectCrossings 重用]** PanelInteriorView 內部已有此函式，aesthetics.ts 需要交叉數 → 將 detectCrossings export 供兩處使用，或 GameBoard 從 PanelInteriorView 的 crossings count 回調取得。選擇提取 detectCrossings 到 aesthetics.ts 成為共用函式。
- **[整線按鈕位置]** 放在 leverTooltip 旁（接線完成後出現），與 CrimpMiniGame trigger 不同（那是自動觸發），整線是手動開啟 overlay。
