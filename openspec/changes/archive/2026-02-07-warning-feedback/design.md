## Context

目前 `audio.ts` 的所有音效都是一次性 `playTone`（建立 oscillator → play → auto-stop）。buzzing 需要持續播放並動態調整音量，是不同的模式。

`CircuitDiagram.tsx` 已有 burned 狀態的煙霧粒子（3 個 SVG circle + CSS 動畫），warning 階段的淡煙可以複用類似結構但調整參數。

## Goals / Non-Goals

**Goals:**
- 在 `audio.ts` 新增持續性 buzzing 音效管理（start / stop / update volume）
- 在 `CircuitDiagram.tsx` 新增 wireHeat ≥ 0.3 時的淡煙粒子
- 在 `GameBoard.tsx` 整合 buzzing 生命週期

**Non-Goals:**
- 不改動 burned 狀態的既有煙霧效果
- 不改動模擬引擎

## Decisions

### 1. Buzzing 音效：持續性 OscillatorNode + GainNode

建立一個長期存活的 OscillatorNode（sawtooth, ~120Hz 低頻電流聲），透過 GainNode 控制音量。提供三個函式：

- `startBuzzing()` — 建立並啟動 oscillator + gain，初始 gain=0
- `updateBuzzingVolume(wireHeat: number)` — 將 wireHeat 映射為 gain 值（0→0, 1→0.12），用 `linearRampToValueAtTime` 平滑過渡
- `stopBuzzing()` — 停止 oscillator 並清除參考

在 GameBoard 中：
- 進入 warning 時呼叫 `startBuzzing()`
- 每幀 tick 中呼叫 `updateBuzzingVolume(wireHeat)`
- 離開 warning（回 normal、burned、tripped、斷電）時呼叫 `stopBuzzing()`

替代方案：用 `setInterval` 重複播放短 tone → 不自然、有節拍感，不像持續電流聲。

### 2. 預警煙霧：SVG 粒子 + CSS 動畫 + 透明度綁定 wireHeat

wireHeat ≥ 0.3 時渲染淡煙粒子（2 個 circle），動畫與 burned 煙霧共用 `smoke-rise` keyframe 但：
- 透明度更低：基礎 opacity 隨 wireHeat 線性映射（0.3→0.1, 0.7→0.4）
- 粒子更小（r=2）
- 動畫更慢（2s vs 1.5s）

wireHeat ≥ 0.7 時加到 3 個粒子，模擬煙霧加濃。

burned 狀態的既有煙霧保持不變（更大、更濃、更快）。

### 3. GameBoard 整合方式

用一個 `useRef<boolean>` 追蹤 buzzing 是否正在播放，避免重複 start。在 tick 函式中根據 `newState.status` 判斷是否需要 start/stop/update。

## Risks / Trade-offs

- [持續 oscillator 可能有瀏覽器相容性問題] → AudioContext 已在 v0.1 驗證可用，同一個 context 建立持續 oscillator 是標準用法
- [淡煙在深色背景上可能不明顯] → 使用 rgba(150,150,150,x) 偏亮灰色，確保可見
