## Why

玩家目前無法控制遊戲音效音量，所有音效（提示音、buzzing 預警、電器運轉音）以硬編碼音量播放。這對於在公共場所或深夜遊玩的玩家造成不便，也缺乏基本的使用者控制權。PRD v0.10 FR-L-D 要求新增音量控制功能。

## What Changes

- 新增 master GainNode 音量控制架構：所有 GainNode 經由 masterGain → ctx.destination，取代直接連接
- 新增 `VolumeControl` UI 元件：音量圖示 + 靜音 toggle + 音量滑桿（0–100%）
- localStorage 持久化音量設定（key: `rewire-volume`，預設 50%）
- 音量滑桿即時生效（不需重新送電）
- 靜音時所有音效完全靜默

## Capabilities

### New Capabilities
- `volume-control`: 音量控制 UI 元件 + master volume 音訊架構 + localStorage 持久化

### Modified Capabilities
_無需修改既有 spec 的需求層級行為_

## Impact

- `src/engine/audio.ts` — 重構：新增 masterGain node，所有 gain.connect 改接 masterGain；新增 setMasterVolume/getMasterVolume/setMuted/isMuted API
- 新增 `src/components/VolumeControl.tsx` — 音量控制 UI 元件
- `src/components/GameBoard.tsx` — 渲染 VolumeControl 元件
- `src/App.css` — VolumeControl 樣式
- `src/locales/*.json`（6 語）— 音量控制相關翻譯 key
