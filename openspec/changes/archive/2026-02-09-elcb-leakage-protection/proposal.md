## Why

v0.4 FR-G（材料擴充）與 FR-E（相位平衡）已完成。FR-F ELCB 漏電保護是 v0.4 最後一塊拼圖 — 引入漏電斷路器的保護機制，讓玩家理解浴室等潮濕環境的安全規範，並在預算取捨中加入新的策略層。目前 ELCB 僅有成本框架（toggle + $35），尚無實際的漏電事件、跳脫邏輯、與失敗判定。

## What Changes

- 新增 `wetArea` 迴路屬性：標記潮濕區域迴路，強制安裝 ELCB 才能送電
- 新增漏電事件系統：腳本式（固定時間觸發）與隨機式（每秒 5% 機率）兩種模式
- 新增 ELCB 跳脫邏輯：漏電時有 ELCB 的迴路自動斷電，無 ELCB 的 wetArea 迴路觸發即時失敗
- 新增 `"leakage"` 失敗類型：觸電危險，與 burned 同等嚴重
- 新增 ELCB 跳脫後迴路狀態：該迴路電器停止運作，其他迴路不受影響
- 新增 wetArea 送電前置檢查：未安裝 ELCB 的 wetArea 迴路阻止全域送電
- 新增 3 個關卡：L13（ELCB 入門）、L14（ELCB 預算壓力）、L15（綜合挑戰）
- 更新 CircuitDiagram SVG：ELCB 跳脫視覺狀態
- 更新 StatusDisplay：ELCB 狀態與漏電事件提示

## Capabilities

### New Capabilities
- `elcb-protection`: ELCB 漏電保護核心機制 — wetArea 屬性、漏電事件觸發、跳脫邏輯、leakage 失敗類型、送電前置檢查
- `elcb-levels`: ELCB 相關關卡定義 — L13/L14/L15 關卡數據與漏電事件配置

### Modified Capabilities
- `elcb-cost`: 新增 wetArea 強制安裝規則（wetArea 迴路 MUST 安裝 ELCB 才能送電）
- `simulation-engine`: 新增漏電事件處理與 ELCB 跳脫邏輯（stepMulti 擴展）
- `multi-circuit-game-controller`: 新增送電前置檢查（wetArea ELCB 驗證）、漏電事件驅動、ELCB 跳脫狀態管理
- `multi-circuit-data-model`: 新增 wetArea / leakageEvents / elcbTripped 等型別

## Impact

- `src/types/game.ts` — CircuitConfig 新增 wetArea、Level 新增 leakageEvents、CircuitState 新增 elcbTripped、SimulationStatus 新增 leakage
- `src/engine/simulation.ts` — stepMulti 處理漏電事件與 ELCB 跳脫
- `src/components/GameBoard.tsx` — 送電前置檢查、漏電事件計時、ELCB 跳脫狀態
- `src/components/CircuitDiagram.tsx` — ELCB 跳脫視覺效果
- `src/components/StatusDisplay.tsx` — ELCB 狀態顯示
- `src/components/ResultPanel.tsx` — leakage 失敗訊息
- `src/data/constants.ts` — 漏電相關常數（LEAKAGE_CHANCE_PER_SECOND）
- `src/data/levels.ts` — L13-L15 關卡定義
