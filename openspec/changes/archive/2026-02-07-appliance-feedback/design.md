## Context

目前送電後電器在 AppliancePanel 中只是靜態的黃色邊框卡片，沒有任何運轉反饋。audio.ts 已有 buzzing 的持續音效模式（OscillatorNode + GainNode），可沿用此架構。

## Goals / Non-Goals

**Goals:**
- 送電後每種已插入電器播放對應的合成環境音
- 已插入電器的卡片顯示運作中 CSS 動畫
- 斷電/跳電/燒毀時音效與動畫立即停止

**Non-Goals:**
- 不為電器繪製獨立的 SVG 圖示（沿用卡片式 UI）
- 不做電器個別音量調整 UI

## Decisions

### 1. 電器音效：每種電器一組 Oscillator

每種電器用不同波形與頻率模擬運作聲：
- 吹風機：白噪音（BiquadFilter bandpass ~2kHz）模擬風聲
- 快煮壺：低頻泡泡聲（sine ~100Hz + 隨機音量調變）
- 微波爐：穩定嗡嗡聲（sine 60Hz）
- 廚下加熱器：極低頻穩定聲（sine 50Hz，很安靜）
- 烘衣機：低頻震動聲（triangle 80Hz + 輕微調變）

音量統一壓低（0.03-0.06），避免蓋過 buzzing 預警音。

API 設計：
```typescript
export function startApplianceSounds(appliances: readonly Appliance[]): void
export function stopApplianceSounds(): void
```

內部用 Map 或陣列追蹤所有活躍 node，stopApplianceSounds 一次性停止全部。

### 2. 運作動畫：CSS class 切換

AppliancePanel 接收 `isPowered` prop，送電時在已插入電器的卡片上加 `operating` class：
- `.card.plugged.operating`：加入 `appliance-operating` 動畫（柔和脈動 glow 效果）
- 動畫用 box-shadow 脈動，不同電器共用同一動畫（簡潔）

### 3. 生命週期管理

- `handlePowerToggle` 送電時呼叫 `startApplianceSounds(pluggedAppliances)`
- `handlePowerToggle` 斷電、`handleRetry`、`handleBackToLevels`、tick 終態時呼叫 `stopApplianceSounds()`
- 與 buzzing 類似，在所有停止路徑中確保呼叫

## Risks / Trade-offs

- [多個 Oscillator 同時播放可能造成音量過大] → 每個電器音量壓在 0.03-0.06，總和不超過 0.3
- [白噪音需要 ScriptProcessor/AudioWorklet] → 改用 BiquadFilter 過濾 oscillator 近似白噪音，避免複雜度
