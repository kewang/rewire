## 1. Audio Engine — Master Volume 架構

- [x] 1.1 在 audio.ts 新增 masterGain node，所有 gain.connect(ctx.destination) 改為 gain.connect(getMasterGain())
- [x] 1.2 新增 setMasterVolume/getMasterVolume API，音量 clamp 0–1，預設 0.5
- [x] 1.3 新增 setMuted/isMuted API，mute 時 masterGain.gain=0，unmute 恢復
- [x] 1.4 新增 localStorage 持久化（key: rewire-volume），模組載入時讀取、變更時寫入

## 2. VolumeControl UI 元件

- [x] 2.1 新增 VolumeControl.tsx：speaker icon SVG + range slider + mute toggle
- [x] 2.2 在 GameBoard 遊戲畫面 header 區域渲染 VolumeControl
- [x] 2.3 新增 VolumeControl CSS 樣式（App.css），適配 desktop/mobile

## 3. i18n 翻譯

- [x] 3.1 六語翻譯檔新增 volume.* keys（mute/unmute/volume tooltip）

## 4. 驗證

- [x] 4.1 npm run lint 通過
- [x] 4.2 npm run build 通過
