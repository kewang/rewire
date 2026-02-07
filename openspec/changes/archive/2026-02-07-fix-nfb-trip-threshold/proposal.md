## Why

L02 關卡無法通關：NFB 在電流等於額定電流時就跳脫，但實際 NFB 應在 1.25 倍額定電流以上才會快速跳脫。這導致正確選用線徑的玩家仍被誤判為跳電。

## What Changes

- 修改 `step()` 函式中的 NFB 跳脫判定閾值，從 `ratedCurrent` 改為 `ratedCurrent * 1.25`
- 跳脫計時器僅在電流超過 1.25 倍額定時才開始累計

## Capabilities

### New Capabilities

### Modified Capabilities
- `simulation-engine`: Breaker trip detection 的跳脫閾值從額定電流改為 1.25 倍額定電流

## Impact

- 修改 `src/engine/simulation.ts`：`step()` 函式中跳脫條件
- 影響所有依賴 NFB 跳脫判定的關卡平衡
