## Context

v0.6 有 10 種電器（6 種 110V、4 種 220V），110V 最大電流 13.6A（快煮壺），永遠不超過 1.6mm²（15A）安全上限。v0.7 自由配迴路機制需要 NFB 成本來建立迴路規劃的經濟取捨。L05 存在 220V 電器放入 110V 迴路的已知 bug。

本 change 是 v0.7 第一步，僅處理資料層面的擴充（常數 + 關卡修復），不涉及 UI 新增或引擎修改。

## Goals / Non-Goals

**Goals:**
- 新增電暖器(16.4A)、烤箱(13.6A)、除濕機(5.5A) 三種 110V 電器
- 定義 NFB 成本常數，供後續自由配迴路使用
- 修復 L05 電器組合 bug（220V→110V 替換）

**Non-Goals:**
- 不在本 change 實作成本計算邏輯（由後續 free-circuit-data-model 處理）
- 不修改 scoring.ts 或 GameBoard（成本計算邏輯不變，僅資料層）
- 不改 L07 bug（L07 將在 free-circuit-levels change 中整個改為自由配迴路格式）

## Decisions

### 1. 電器附加到陣列末尾

在 `DEFAULT_APPLIANCES` 陣列末尾新增 3 種電器，index 10/11/12。解構賦值加入 `heater`、`oven`、`dehumidifier` 變數供 levels.ts 使用。

**理由**：保持既有 index 不變，不影響任何現有關卡。

### 2. NFB 成本常數獨立定義

在 `constants.ts` 新增 `NFB_COST_15A = 10`、`NFB_COST_20A = 15`、`NFB_COST_30A = 20` 三個命名常數，另新增 `NFB_COSTS` Record 物件方便以 ratedCurrent 查詢。

```typescript
export const NFB_COST_15A = 10;
export const NFB_COST_20A = 15;
export const NFB_COST_30A = 20;
export const NFB_COSTS: Record<number, number> = {
  15: NFB_COST_15A,
  20: NFB_COST_20A,
  30: NFB_COST_30A,
};
```

**理由**：命名常數保持可讀性，Record 方便動態查詢。後續 change 的成本計算可直接 `NFB_COSTS[breaker.ratedCurrent]`。

### 3. L05 修復策略

將 L05 的 `dryer`(220V) 替換為 `heater`(電暖器 16.4A) + `kettle`(快煮壺 13.6A)：
- 總電流 30A — 與原始描述一致的高壓力場景
- NFB 改用 `BREAKER_30A`（30A 閾值 37.5A，30A 電流不會跳脫）
- 預算調整為 $130（需要 5.5mm² = $120，留少量餘裕）
- 描述更新：「電暖器 + 快煮壺，合計 30A。需要粗線才撐得住！」

**理由**：PRD v0.7 FR-D 明確指定此修復方案。兩台高功率 110V 電器合計 30A 剛好需要 5.5mm²（30A 安全容量），形成有意義的線材選擇挑戰。

## Risks / Trade-offs

- [L05 難度大增] 原 L05 因 bug 實質無電流，修復後變成 30A 高壓力場景 → 可接受，這是教學關卡應有的漸進式挑戰
- [NFB 成本常數暫無使用處] 本 change 僅定義常數，尚無程式碼引用 → 後續 change 會使用，提前定義避免跨 change 依賴
