## Why

目前 220V 電器（烘衣機）與 110V 電器在遊戲中幾乎無差異 — 烘衣機 2200W/220V=10A 與吹風機 1200W/110V=10.9A 電流相近，玩家感受不到電壓區分的意義。真實配電中，220V 電器必須使用專用迴路（2P NFB + 雙相線），不能與 110V 電器混用。這是配電知識的核心概念，必須在遊戲中體現。

## What Changes

- CircuitConfig 新增 `voltage: 110 | 220` 欄位，定義迴路電壓屬性
- 220V 迴路使用 2P NFB（視覺上與 1P 區分），110V 迴路使用 1P NFB
- 電壓不相容限制：220V 電器只能分配到 220V 迴路，110V 電器只能分配到 110V 迴路
- AppliancePanel 依迴路電壓過濾可用電器，不相容電器顯示為 disabled 並標示原因
- CircuitDiagram 視覺區分：220V 迴路使用雙線（紅+黑雙相）表現，110V 迴路維持單線；插座形狀不同（220V T 型 / 110V 標準雙扁）
- 新增關卡利用混合電壓迴路設計挑戰（如 L09: 110V+220V 混合配電）
- 更新現有多迴路關卡 L06-L08，部分迴路設定為 220V

## Capabilities

### New Capabilities
- `voltage-circuit`: 迴路電壓屬性（110V/220V）、電壓相容性驗證、2P/1P NFB 區分
- `voltage-visual`: 電壓相關的視覺表現（雙線/單線迴路圖、T型/標準插座、NFB 外觀區分、電壓標示）

### Modified Capabilities
- `multi-circuit-levels`: 更新現有關卡加入電壓設定，新增混合電壓關卡
- `multi-circuit-appliance-assignment`: AppliancePanel 依迴路電壓過濾電器

## Impact

- **型別系統**: `CircuitConfig` 新增 voltage 欄位；`Appliance.voltage` 已存在可直接使用
- **模擬引擎**: `step()` 新增電壓不相容檢查（理論上不應發生，因 UI 已阻擋）
- **UI 元件**: CircuitDiagram（SVG 雙線/插座/NFB）、AppliancePanel（過濾+disabled）、StatusDisplay（電壓標示）
- **關卡資料**: levels.ts 所有多迴路關卡需加 voltage 欄位；新增 1-2 個混合電壓關卡
- **無 breaking change**: 單迴路關卡不受影響（voltage 預設 110）
