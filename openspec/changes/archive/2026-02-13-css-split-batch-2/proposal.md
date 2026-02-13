## Why

App.css 拆分第二批。抽取 GameBoard 佈局與 VolumeControl 樣式到獨立檔案。

## What Changes

- 從 `src/App.css` 抽取 Game Board 區段到 `src/components/GameBoard.css`
- 從 `src/App.css` 抽取 Volume Control 區段到 `src/components/VolumeControl.css`
- 各元件 `.tsx` 加上 CSS import
- App.css 對應區段移除

## Capabilities

### New Capabilities
_無新功能，純重構。_

### Modified Capabilities
_無需求變更。_

## Impact

- `src/App.css` — 移除約 250 行
- 新增 2 個 CSS 檔案
- 2 個 `.tsx` 新增 CSS import
