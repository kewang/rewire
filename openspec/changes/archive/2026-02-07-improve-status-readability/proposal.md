## Why

狀態面板（StatusDisplay）使用深黑背景 `#111`，但數值文字沒有明確設定前景色，label 使用 `#888` 灰色，整體對比度不足，在一般螢幕上難以辨識。需改善配色以符合 WCAG AA 對比度標準。

## What Changes

- 提高 status-label 顏色亮度（從 `#888` 調整為更亮的灰色）
- 為 status-value 明確設定亮色前景色
- 確保所有文字在 `#111` 背景上達到 4.5:1 以上對比度

## Capabilities

### New Capabilities

### Modified Capabilities
- `game-ui`: Real-time status display 的文字配色對比度改善

## Impact

- 修改 `src/App.css`：status-label、status-value 的顏色設定
