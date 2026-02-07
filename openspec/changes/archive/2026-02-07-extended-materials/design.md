## Context

v0.1 提供 3 種線材（1.6/2.0/5.5mm²）和 3 種 110V 電器，搭配 3 個關卡。所有資料定義在 `src/data/constants.ts` 和 `src/data/levels.ts`，UI 元件從這些常數陣列動態渲染，模擬引擎使用 `power / voltage` 計算電流，已支援任意電壓。

## Goals / Non-Goals

**Goals:**
- 在 `constants.ts` 新增 2 種線材和 2 種電器（含 220V）
- 在 `levels.ts` 新增 3 個關卡（L04-L06）
- 確保現有 UI 和模擬引擎無需修改即可正常運作

**Non-Goals:**
- 不修改模擬引擎邏輯
- 不修改 UI 元件程式碼
- 不新增 220V 專用 NFB（仍使用固定 20A）

## Decisions

### 1. 純資料層變更，不動邏輯層

新增的線材和電器僅是在既有常數陣列中追加項目。模擬引擎的 `calcTotalCurrent` 已用 `power / voltage` 計算，天然支援 220V。UI 元件（WireSelector、AppliancePanel、LevelSelect）從陣列動態渲染，不需硬編碼。

替代方案：為 220V 電器新增專用 UI 標示 → 不需要，目前 AppliancePanel 已顯示電壓值。

### 2. 線材排序：按線徑由小到大

新增的 3.5mm² 和 8mm² 插入陣列中正確的位置（1.6 → 2.0 → 3.5 → 5.5 → 8），讓玩家直覺地從細到粗選擇。

### 3. L04-L06 關卡設計策略

- L04（低功率陷阱）：3 台 110V 合計 31.8A，3.5mm²（25A）是陷阱，必須用 5.5mm²（30A）但預算緊
- L05（220V 專用迴路）：烘衣機 10A 看似簡單，教育玩家 220V 計算
- L06（混合電壓）：110V + 220V 合計 20.9A，剛好超過 2.0mm²，存活時間拉長到 8 秒

## Risks / Trade-offs

- [5 種線材可能讓選擇面板擁擠] → 目前卡片式 UI 可水平或垂直捲動，5 張卡片仍在合理範圍
- [220V 電器無額外視覺標示] → AppliancePanel 已顯示電壓數值，暫不需額外處理
