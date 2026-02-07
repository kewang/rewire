## Why

v0.1 送電後電器無任何運作反饋，玩家只能從數值判斷通電是否成功，缺乏「成功通電」的成就感與沈浸感。加入電器運作音效與動畫，可以讓送電瞬間更有回饋感。

## What Changes

- 新增每種電器的運作音效，使用 Web Audio API 合成（吹風機風聲、快煮壺水滾聲等），送電時開始播放、斷電/終態時停止
- 新增電器運作動畫，在已插入電器的卡片上用 CSS 動畫表示運作中（如脈動、閃爍等）
- 斷電、跳電、燒毀時音效與動畫立即停止

## Capabilities

### New Capabilities

- `appliance-feedback`: 電器運轉回饋 — 送電後電器的運作音效與視覺動畫

### Modified Capabilities

（無）

## Impact

- `src/engine/audio.ts` — 新增電器音效函式（startApplianceSounds / stopApplianceSounds）
- `src/components/AppliancePanel.tsx` — 已插入電器卡片加入運作中動畫
- `src/components/GameBoard.tsx` — 送電/斷電時呼叫電器音效
- `src/App.css` — 新增電器運作動畫 keyframes
