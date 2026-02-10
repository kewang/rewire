## Why

v0.7 的核心功能是「自由配迴路」——玩家自行決定迴路數量、電壓、NFB、電器分配。目前 `Level` 型別只支援固定迴路（`circuitConfigs`），需要新增 `FreeCircuitLevel` 型別（含 `rooms` + `panel`），並以 discriminated union 讓兩種關卡共存。這是所有後續自由配迴路 UI / 模擬 / 關卡的型別基礎。

## What Changes

- 新增 `Room` interface（房間定義：id / name / appliances / wetArea）
- 新增 `PanelConfig` interface（配電箱規格：maxSlots / mainBreakerRating）
- 新增 `FreeCircuitLevel` interface（自由配迴路關卡：rooms / panel + 沿用既有可選機制欄位）
- 重新命名現有 `Level` 為 `FixedCircuitLevel`（含 circuitConfigs / requiredAppliances）
- 新增 `Level` union type = `FixedCircuitLevel | FreeCircuitLevel`
- 新增 `isFreeCircuitLevel` / `isFixedCircuitLevel` type guard 函式
- 新增 `SimulationStatus: 'main-tripped'`（主開關跳脫）
- 擴充 `MultiCircuitState` 新增 `mainBreakerTripTimer` 欄位
- 更新 `worstStatus` helper 支援 `'main-tripped'`
- 更新 `levels.ts` 中所有現有關卡定義的型別標註（仍為固定迴路，無行為變更）

## Capabilities

### New Capabilities
- `free-circuit-level`: FreeCircuitLevel / Room / PanelConfig 型別定義 + Level union type + type guards

### Modified Capabilities
- `multi-circuit-data-model`: 新增 `'main-tripped'` 到 SimulationStatus + `mainBreakerTripTimer` 到 MultiCircuitState + `worstStatus` 擴充
- `game-data-model`: 將 Level 改為 union type（FixedCircuitLevel | FreeCircuitLevel），既有 Level 欄位重新組織

## Impact

- `src/types/game.ts` — 新增 Room / PanelConfig / FreeCircuitLevel 型別，重構 Level 為 union
- `src/types/helpers.ts` — 新增 type guards，擴充 worstStatus
- `src/data/levels.ts` — 型別標註更新（加 `satisfies FixedCircuitLevel`）
- `src/components/GameBoard.tsx` — 可能需要 type narrowing（但行為不變）
- `src/engine/simulation.ts` — MultiCircuitState 新增欄位（預設值處理）
