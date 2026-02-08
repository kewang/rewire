## Context

v0.3 完成了多迴路架構與 110V/220V 電壓區分，目前有 5 種線材、6 種電器、固定 20A NFB。v0.4 PRD 要求擴充到 6 線材 / 10 電器、NFB 多規格、並引入 ELCB 成本項目。本 change（FR-G）是 v0.4 的第一步，為後續 FR-E（相位平衡）和 FR-F（ELCB 機制）提供內容基礎。

現有架構：
- `constants.ts` 以 `as const satisfies` 定義線材/電器陣列
- `Breaker` 型別已有 `ratedCurrent` + `tripDelay`，關卡 `CircuitConfig.breaker` 已支援自訂
- `DEFAULT_BREAKER` 為全域預設（20A），但各關卡可在 `circuitConfigs` 中覆寫
- 成本計算在 `GameBoard.tsx` 中：`Σ(wire.costPerMeter × DEFAULT_WIRE_LENGTH)`
- 線材顏色在 `CircuitDiagram.tsx` 的 `getWireColor()` 函式中映射
- 電器音效在 `audio.ts` 中 `playApplianceSound()` 依電器 name 匹配

## Goals / Non-Goals

**Goals:**
- 新增 14mm² 線材與 4 種電器到常數檔
- NFB 預設常數擴充為 3 種規格（15A/20A/30A），方便關卡引用
- 在型別系統中為 ELCB 預留欄位（CircuitConfig 新增 `elcbAvailable?: boolean`），GameBoard 成本計算加入 ELCB
- 新增 L10 關卡
- UI 元件支援新材料顯示（線材顏色、電器音效）

**Non-Goals:**
- ELCB 的漏電偵測/跳脫機制（屬於 FR-F）
- 相位（phase）相關欄位（屬於 FR-E）
- 修改現有 L01-L09 關卡的 breaker 值（它們已正常運作）

## Decisions

### 1. 線材顏色：14mm² 用紫色 (#a855f7)

現有映射：1.6 藍、2.0 綠、3.5 黃、5.5 橘、8.0 紅。14mm² 選紫色，與既有顏色有足夠視覺區分。

**替代方案**：白色 — 在深色背景上辨識度好但缺乏「工業感」。紫色符合「電流越大顏色越深/暖」的漸進感。

### 2. NFB 預設常數：提供 3 個命名常數而非陣列

```ts
export const BREAKER_15A: Breaker = { ratedCurrent: 15, tripDelay: 1.5 };
export const BREAKER_20A: Breaker = { ratedCurrent: 20, tripDelay: 1.5 };
export const BREAKER_30A: Breaker = { ratedCurrent: 30, tripDelay: 1.5 };
```

保留原有 `DEFAULT_BREAKER`（= BREAKER_20A）避免破壞舊關卡。命名常數比陣列更直觀，關卡定義直接引用 `BREAKER_30A`。

**替代方案**：陣列 `DEFAULT_BREAKERS` — 需要 `.find()` 查詢，多一步不必要的間接層。

### 3. ELCB 型別：CircuitConfig 新增可選欄位

```ts
interface CircuitConfig {
  // ...existing fields
  readonly elcbAvailable?: boolean;  // 該迴路是否可安裝 ELCB（由關卡定義）
}
```

GameBoard 新增 per-circuit `hasElcb` state（玩家選擇是否安裝）。成本公式：`totalCost = Σ(wire cost) + Σ(hasElcb ? ELCB_COST : 0)`。

本 change 只做成本計算與 UI 開關，ELCB 的漏電偵測邏輯留給 FR-F。

**替代方案**：獨立 `ElcbConfig` 物件 — 過度設計，目前只需 boolean + 固定價格。

### 4. ELCB 成本常數

```ts
export const ELCB_COST = 35;
```

置於 `constants.ts`，與線材/電器常數一致。

### 5. 新電器音效：延續 Web Audio API 合成模式

| 電器 | 音色特徵 |
|------|----------|
| IH 爐 | 高頻嗡鳴（square 2000Hz），模擬電磁加熱 |
| 冰箱 | 低頻穩定嗡聲（sine 100Hz），模擬壓縮機 |
| 冷氣 | 白噪音 + 低頻振盪，模擬壓縮機+風扇 |
| 浴室暖風機 | 中頻嗡聲（triangle 300Hz），模擬風扇馬達 |

## Risks / Trade-offs

- **[10 種電器 UI 擁擠]** → AppliancePanel 已有電壓過濾，每個迴路只顯示相容電器（約 5-6 個），不會全部堆疊
- **[14mm² 是預算陷阱]** → 設計意圖如此（PRD 明確標示），$280 成本讓玩家學習「不是越粗越好」
- **[ELCB 欄位先於機制]** → 型別系統先行是本專案慣例（multi-circuit-types 先於 multi-circuit-engine），FR-F 實作時不需再改型別
