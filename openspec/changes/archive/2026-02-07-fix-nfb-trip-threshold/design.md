## Context

目前 `simulation.ts` 的 `step()` 函式中，NFB 跳脫判定為 `totalCurrent > circuit.breaker.ratedCurrent`，即電流一超過額定值就開始累計跳脫計時。但實際 NFB 規格為在 1.25 倍額定電流以上才會快速跳脫，這導致 L02 關卡中選用正確線徑的玩家也會被誤判跳電。

## Goals / Non-Goals

**Goals:**
- 將 NFB 跳脫閾值從額定電流改為 1.25 倍額定電流，符合實際 NFB 特性
- 讓 L02 使用 5.5mm² 線材可以正常通關

**Non-Goals:**
- 不實作完整的 NFB 反時限跳脫曲線（目前用固定延遲即可）
- 不修改 Breaker 型別定義

## Decisions

### Decision 1: 使用固定 1.25 倍數

在 `step()` 中計算 `tripThreshold = ratedCurrent * 1.25`，以此取代直接使用 `ratedCurrent` 作為比較值。1.25 倍是台灣電工法規中 NFB 快速跳脫的常見門檻。

## Risks / Trade-offs

- **倍數寫死在程式碼中** → 目前只有一種 NFB，暫不需要參數化。未來可加入 Breaker 的 `tripMultiplier` 欄位。
