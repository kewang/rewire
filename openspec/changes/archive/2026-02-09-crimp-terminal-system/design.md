## Context

目前玩家選完線材、拖曳接線後就可以送電。線材熱度只受「實際電流 vs 線材安全電流」影響。v0.5 引入壓接端子系統，新增「接線品質」維度：壓接品質差 → 接觸電阻高 → 有效加熱電流增加 → 加速過熱。

現有架構：
- `step()` 用 `totalCurrent` 比對 `wire.maxCurrent` 計算 wireHeat
- `handleDragEnd()` 完成接線後直接更新 WiringState，無中間步驟
- `Circuit` 不含接觸電阻資訊

## Goals / Non-Goals

**Goals:**
- 引入 CrimpQuality 和 contactResistance 概念，讓 step() 用 effectiveCurrent 計算 wireHeat
- 新增壓接小遊戲 overlay，拖曳接線後觸發
- 壓接品質視覺回饋（電路圖端子圖示 + 品質色碼）
- L16-L17 壓接端子關卡
- L01-L15 完全不受影響

**Non-Goals:**
- 老屋驚魂模式（v0.5 後續 change）
- 三星評分系統（v0.5 後續 change）
- 端子成本（PRD 決定免費）

## Decisions

### D1: contactResistance 注入方式

**選擇**：Circuit 介面新增 `contactResistance?: number`（預設 1.0），由 GameBoard 建構 Circuit 時從壓接狀態注入。

**替代方案**：在 step() 簽名新增參數 → 破壞 stepMulti 簽名，改動範圍更大。

**理由**：Circuit 已作為 step() 的完整輸入描述迴路狀態，contactResistance 屬於迴路固有屬性（壓接後不變）。

### D2: effectiveCurrent 計算位置

**選擇**：在 step() 內部，wireHeat 計算時用 `effectiveCurrent = totalCurrent × √contactResistance`。NFB 跳脫和 warning 狀態判定仍用 totalCurrent。

**理由**：物理正確（NFB 偵測線路電流，不感知接點電阻）。修改最小化 — 只改 step() 中 wireHeat 相關程式碼。

### D3: 壓接狀態管理

**選擇**：GameBoard 新增 `circuitCrimps: Record<CircuitId, CrimpResult>` state，CrimpResult 包含 `{ terminalType, quality, contactResistance }`。

**理由**：與 circuitWires / circuitElcb 同層級管理，一致性好。建構 Circuit 時從 circuitCrimps 取 contactResistance。

### D4: 壓接小遊戲觸發流程

**選擇**：handleDragEnd 成功 drop 時，若 `level.requiresCrimp`，不直接標記 isWired，而是設定 `pendingCrimpCircuitId` state → 顯示 CrimpMiniGame overlay → 完成後才更新 isWired + circuitCrimps。

**替代方案**：先標記 isWired 再彈壓接 → 但這讓不壓接也能送電，違反需求。

**理由**：requiresCrimp 關卡需要壓接完成才算接線完成，流程自然。非 requiresCrimp 關卡跳過小遊戲，直接 isWired + contactResistance=1.0。

### D5: 壓接小遊戲 UI

**選擇**：新增 `CrimpMiniGame.tsx` overlay 元件。

- 步驟 1：選端子類型（O 型環 / Y 型叉），不相容的 disabled
- 步驟 2：進度條動畫（requestAnimationFrame），玩家點擊停止
- 步驟 3：結果顯示（品質文字 + 接觸電阻倍率）+ 確認按鈕

**進度條判定**：
- 進度 0→1 循環，速度 0.8/秒（~1.25 秒一圈）
- 甜蜜區中心 ±5% = excellent
- 甜蜜區 ±15% = good
- 其餘 = poor
- 可跳過（非 requiresCrimp 時）= none

### D6: 端子類型相容性

**選擇**：常數定義 `CRIMP_TERMINALS`，每個端子 `compatibleCrossSections: number[]`。運行時用 includes 檢查。

- O 型環：[1.6, 2.0, 3.5, 5.5]
- Y 型叉：[1.6, 2.0, 3.5, 5.5, 8, 14]（全線徑）

### D7: 電路圖端子視覺

**選擇**：SingleCircuitSVG 在 NFB 底部連接點位置繪製小圖示。

- O 型環：小圓圈（circle r=4）
- Y 型叉：小叉形（兩條斜線）
- 品質色碼：excellent=#22c55e, good=#84cc16, poor=#f97316, none=#ef4444 虛線

## Risks / Trade-offs

- **[進度條難度調校]** → 甜蜜區寬度可能太容易或太難 → 用常數定義，後續可微調
- **[壓接小遊戲中斷體驗]** → overlay 會中斷接線→送電流程 → 保持小遊戲精簡快速（<3 秒完成）
- **[觸控裝置壓接操作]** → 點擊/觸控在進度條上操作 → 用 pointerdown 事件統一處理
