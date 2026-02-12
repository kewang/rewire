## Why

目前遊戲沒有任何錯誤邊界。若任何元件在 render 時 throw Error（例如資料異常、型別錯誤），整個 React tree 會卸載，使用者看到白屏且無法恢復，只能手動重新整理。需要 Error Boundary 作為安全網，在錯誤發生時顯示友善 fallback UI 並提供回到關卡選擇的途徑。

## What Changes

- 新增 `ErrorBoundary` class component（React Error Boundary 僅支援 class component）
- 頂層包裹 App，GameBoard 區域額外包裹一層（遊戲錯誤不影響整個 App）
- 錯誤 fallback UI：顯示錯誤訊息 + 「回到關卡選擇」按鈕
- 支援 i18n（六語錯誤訊息）
- console.error 記錄完整 stack trace

## Capabilities

### New Capabilities
- `error-boundary`: React Error Boundary 元件，攔截渲染錯誤並顯示 fallback UI

### Modified Capabilities
（無既有 spec 需修改）

## Impact

- 新增 `src/components/ErrorBoundary.tsx`
- 修改 `src/App.tsx` — 包裹 ErrorBoundary
- 修改 `src/locales/*.json` — 新增錯誤訊息翻譯 key
- 不影響任何遊戲邏輯
