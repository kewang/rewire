## Why

目前 UI 只支援單一迴路——一個 NFB、一條線、一個插座。型別系統和模擬引擎已完成多迴路重構（multi-circuit-types、multi-circuit-engine），但 GameBoard 仍以 `DEFAULT_CIRCUIT_ID = 'c1'` 硬編碼單迴路，CircuitDiagram 只繪製一組電路。需將 UI 元件升級為動態支援多迴路，讓未來新增多迴路關卡（L06+）時前端直接可用。

## What Changes

- **CircuitDiagram** 從單迴路 SVG 改為接收 Circuit[] 並列繪製多組 NFB + 線材 + 插座
- **GameBoard** 改為依 Level.circuitConfigs 動態建立 Circuit[]，每個迴路獨立管理 Wire 與 Appliance
- **WiringState** 的 `circuits` map 啟用——拖曳接線時指定目標迴路
- **AppliancePanel** 支援選擇目標迴路，電器分配到特定迴路
- **StatusDisplay** 可顯示多迴路各自狀態（電流、熱度），或以 tab/摘要形式呈現
- **ResultPanel** 支援標示是哪個迴路跳電/燒毀
- 向後相容：L01-L05 單迴路關卡外觀與行為不變

## Capabilities

### New Capabilities
- `multi-circuit-diagram`: SVG 多迴路並列佈局（多組 NFB + 線材 + 插座），拖曳接線指定迴路
- `multi-circuit-game-controller`: GameBoard 動態管理多迴路的 Wire/Appliance/WiringState
- `multi-circuit-appliance-assignment`: 電器分配到特定迴路的 UI 互動

### Modified Capabilities
- `game-ui`: Status display 和 result panel 需支援多迴路資訊呈現

## Impact

- `src/components/CircuitDiagram.tsx` — 重寫 SVG 佈局支援多迴路並列
- `src/components/GameBoard.tsx` — 從 single-circuit 硬編碼改為 dynamic multi-circuit
- `src/components/AppliancePanel.tsx` — 新增迴路選擇 UI
- `src/components/StatusDisplay.tsx` — 多迴路狀態摘要
- `src/components/ResultPanel.tsx` — 標示失敗迴路
- `src/types/game.ts` — 可能微調 WiringState（啟用已有的 circuits map）
- `src/App.css` — 多迴路相關樣式
