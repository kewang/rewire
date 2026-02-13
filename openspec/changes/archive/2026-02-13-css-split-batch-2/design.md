## Context

App.css CSS 拆分系列第二批，處理 GameBoard 佈局與 VolumeControl。

## Goals / Non-Goals

**Goals:**
- GameBoard 佈局樣式（game-board/game-header/game-main/panel-left/panel-right）搬入 GameBoard.css
- VolumeControl 樣式搬入 VolumeControl.css

**Non-Goals:**
- 不動 ELCB Panel / Phase Balance / Cards 等其他區段（後續批次處理）
- 不修改任何樣式規則

## Decisions

1. GameBoard 區段範圍：從 `/* ── Game Board */` 到下一個 section header 前
2. VolumeControl 是 GameBoard 區段內的子區段，獨立抽出到 VolumeControl.css

## Risks / Trade-offs

- 風險極低，純搬遷
