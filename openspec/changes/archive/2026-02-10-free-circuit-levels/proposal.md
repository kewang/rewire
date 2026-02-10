## Why

v0.7 的自由配迴路機制（型別、UI、模擬引擎、相位/ELCB 整合）已全部就緒，但目前 L06-L17 與 L21-L23 仍為舊的固定迴路（FixedCircuitLevel）格式。需要將這些關卡全面改寫為 FreeCircuitLevel 格式，讓玩家體驗「自己規劃迴路」的核心玩法。

## What Changes

- 將 L06-L10（基礎多迴路）改寫為 FreeCircuitLevel，使用 rooms + panel 定義
- 將 L11-L12（相位平衡）改寫為 FreeCircuitLevel + phaseMode
- 將 L13-L15（ELCB/漏電）改寫為 FreeCircuitLevel + leakageMode/leakageEvents
- 將 L16-L17（壓接端子）改寫為 FreeCircuitLevel + requiresCrimp
- 將 L21-L23（走線整理）改寫為 FreeCircuitLevel + requiresRouting + requiresCrimp
- L01-L05（教學）和 L18-L20（老屋）維持不變
- 移除舊 L06-L17/L21-L23 的 circuitConfigs/requiredAppliances 定義
- 關卡描述、預算、存活時間、bonusCondition 按 PRD v0.7 FR-E 重新設計

## Capabilities

### New Capabilities

- `free-circuit-level-definitions`: L06-L17/L21-L23 的 FreeCircuitLevel 關卡資料定義（rooms、panel、各種機制旗標）

### Modified Capabilities

（無 — 僅資料層變更，不涉及 spec 層級的行為變更）

## Impact

- `src/data/levels.ts` — 主要變更檔案，L06-L17/L21-L23 全部改寫
- `src/data/constants.ts` — 可能需要新增 destructure（oven, dehumidifier）
- localStorage 星等 — 被替換關卡的星等數據將自然重置（ID 不變，但難度/結構改變）
