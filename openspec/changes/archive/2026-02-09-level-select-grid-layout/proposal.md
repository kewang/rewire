## Why

目前關卡選擇畫面（LevelSelect）使用單欄垂直排列（`flex-direction: column`，`max-width: 640px`），每張關卡卡片佔滿整行，隨著關卡數量增加到 17 個，玩家必須大幅往下捲動才能看到後面的關卡，操作不方便。改為 grid 排列可讓所有關卡一目瞭然，減少捲動距離。

## What Changes

- 將 `.level-list` 從 `flex-direction: column` 改為 CSS Grid，從左到右、從上到下排列
- 移除 `.level-select` 的 `max-width: 640px` 限制，改為更寬的容器以容納多欄 grid
- 縮減 `.level-card` 的內容密度，使卡片更緊湊以適應 grid 佈局
- 響應式適配：桌面版 3-4 欄、平板 2-3 欄、手機版 1-2 欄

## Capabilities

### New Capabilities

_無新增 capability_

### Modified Capabilities

- `game-ui`: 關卡選擇畫面的佈局從單欄改為多欄 grid 排列

## Impact

- `src/components/LevelSelect.tsx` — 可能需要微調 HTML 結構
- `src/App.css` — `.level-select`、`.level-list`、`.level-card` 樣式修改 + responsive breakpoints 更新
