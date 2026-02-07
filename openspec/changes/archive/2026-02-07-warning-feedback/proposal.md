## Why

v0.1 的 warning 狀態只有線色漸變和脈動發光，缺乏音效與煙霧。玩家在過載預警階段感受不到「危險正在逼近」的緊張感，燒毀往往突然發生。需要在 warning 階段就提供聽覺和視覺預警，讓玩家有反應時間和臨場感。

## What Changes

- 新增持續性「滋滋聲」buzzing 音效：進入 warning 狀態後開始播放，音量隨 wireHeat 漸增，回到 normal 時停止
- 新增預警冒煙效果：wireHeat ≥ 0.3 時接點處出現淡煙粒子，透明度和密度隨 wireHeat 漸增，與 burned 的濃煙區分

## Capabilities

### New Capabilities

（無新增獨立能力）

### Modified Capabilities

- `visual-feedback`: 新增 warning 階段的持續性 buzzing 音效和預警煙霧粒子效果

## Impact

- `src/engine/audio.ts` — 新增 buzzing 音效的 start/stop/update 函式（持續性 oscillator，非一次性 playTone）
- `src/components/CircuitDiagram.tsx` — 新增 wireHeat ≥ 0.3 時的淡煙粒子渲染
- `src/components/GameBoard.tsx` — 在 rAF loop 和 power toggle 中管理 buzzing 生命週期
