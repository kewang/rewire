## Why

App.css 已膨脹至 4,589 行，所有 23 個元件的樣式集中在單一檔案，難以定位與維護。將樣式按元件拆分為獨立 CSS 檔，提升可維護性。本批次先處理最小的 3 個元件（LevelSelect、LanguageSwitcher、ErrorFallback）作為起手式。

## What Changes

- 從 `src/App.css` 抽取 LevelSelect 相關樣式到 `src/components/LevelSelect.css`
- 從 `src/App.css` 抽取 LanguageSwitcher 相關樣式到 `src/components/LanguageSwitcher.css`
- 從 `src/App.css` 抽取 ErrorFallback 相關樣式到 `src/components/ErrorFallback.css`
- 各元件 `.tsx` 加上 `import './XxxComponent.css'`
- App.css 中對應區段移除

## Capabilities

### New Capabilities

_無新功能，純重構。_

### Modified Capabilities

_無需求變更，僅檔案組織調整。_

## Impact

- `src/App.css` — 移除約 250 行
- `src/components/LevelSelect.tsx` — 新增 CSS import
- `src/components/LanguageSwitcher.tsx` — 新增 CSS import
- `src/components/ErrorBoundary.tsx` — 新增 CSS import
- 新增 3 個 CSS 檔案
- 零功能變更，純樣式檔案搬遷
