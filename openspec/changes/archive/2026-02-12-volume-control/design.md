## Context

目前 `src/engine/audio.ts` 中所有音效的 GainNode 直接連接到 `AudioContext.destination`，沒有中央音量控制點。音效音量以硬編碼值設定（playTone 0.15、buzzing 0.12、各電器 0.03–0.05）。玩家無法調整或靜音。

## Goals / Non-Goals

**Goals:**
- 所有音效經由單一 masterGain 節點控制，實現全域音量調節
- UI 提供靜音 toggle + 音量滑桿
- 音量設定 localStorage 持久化
- 即時生效，不需重新送電或重新啟動音效

**Non-Goals:**
- 不做分類音量控制（如分開控制提示音 vs 環境音）
- 不做音效品質提升（真實音檔替換）
- 不做 per-appliance 音量調節

## Decisions

### D1: Master GainNode 架構

**選擇**: 在 AudioContext 和 destination 之間插入一個 masterGain 節點，所有音效的 gain 連接到 masterGain 而非 ctx.destination。

**理由**: Web Audio API 原生支援 GainNode 串接，修改最小且效能零開銷。所有既有音效只需將 `gain.connect(ctx.destination)` 改為 `gain.connect(masterGain)`。

**替代方案**: 在每個 GainNode 上乘以 volume 係數 — 侵入性高，需修改每處 setValueAtTime 呼叫，且新增音效容易遺漏。

### D2: UI 元件位置

**選擇**: 音量圖示固定在遊戲畫面右上角（與 LanguageSwitcher 同列），點擊 toggle 靜音，hover/click 展開音量滑桿。

**理由**: 右上角是常見音量控制位置，不遮擋遊戲內容。與語言切換器同列保持 UI 一致性。

**替代方案**: 放在設定面板中 — 操作路徑過長，玩家需要快速靜音的場景無法滿足。

### D3: 狀態管理

**選擇**: audio.ts 模組內部維護 masterVolume（0–1）和 muted boolean，透過 exported functions（setMasterVolume/getMasterVolume/setMuted/isMuted）操作。VolumeControl 元件用 useState 同步 UI。

**理由**: 音量是音頻引擎的關注點，不應提升到 React state tree。元件僅需在 mount 時從 audio.ts 讀取初始值，操作時呼叫 API 即可。

### D4: localStorage 持久化

**選擇**: key `rewire-volume` 儲存 `{ volume: number, muted: boolean }` JSON。audio.ts 初始化時讀取，setMasterVolume/setMuted 時寫入。

**理由**: 與既有 rewire-stars/rewire-lang 等 localStorage 用法一致。預設音量 50%（0.5）。

### D5: 滑桿互動設計

**選擇**: 點擊音量圖示 toggle 靜音。圖示旁顯示水平滑桿（HTML range input），始終可見。

**理由**: 簡單直覺。PRD 提及「長按或右鍵展開」，但這會增加複雜度且行動裝置不支援右鍵。改為滑桿始終可見（佔位小），點擊圖示 toggle 靜音即可。

## Risks / Trade-offs

- **[Risk] AudioContext 尚未建立時設定音量** → masterGain 在 getCtx() 首次呼叫時才建立，之前的 setMasterVolume 僅更新內部變數，建立時套用。
- **[Risk] 行動裝置 range input 觸控體驗** → 使用原生 `<input type="range">`，瀏覽器已有良好觸控支援。
- **[Trade-off] 滑桿始終可見 vs 摺疊** → 犧牲少量水平空間換取操作便利性。滑桿寬度控制在 80px 內。
