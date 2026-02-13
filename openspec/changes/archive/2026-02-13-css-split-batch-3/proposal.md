## Why
App.css 拆分第三批。抽取 StatusDisplay、ResultPanel、BeforeAfterView 樣式。

## What Changes
- 從 App.css 抽取 3 個元件區段到獨立 CSS 檔
- 各元件 .tsx 加上 CSS import
- App.css 對應區段移除

## Capabilities
### New Capabilities
_無_
### Modified Capabilities
_無_

## Impact
- `src/App.css` — 移除約 340 行
- 新增 3 個 CSS 檔案
