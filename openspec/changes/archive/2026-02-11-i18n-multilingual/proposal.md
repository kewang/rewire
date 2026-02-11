## Why

目前遊戲僅支援中文（zh-TW）與英文（en）雙語。為擴大國際受眾，新增日文、韓文、法文、泰文四種語言，使遊戲涵蓋東亞、東南亞及歐語區玩家。同時 LanguageSwitcher 需從雙語切換按鈕升級為多語下拉選單。

## What Changes

- 新增 4 個翻譯檔：`src/locales/ja.json`、`ko.json`、`fr.json`、`th.json`，完整翻譯所有 UI 文字
- 更新 `src/i18n.ts`：import 並註冊 4 種新語言資源，export `SUPPORTED_LANGUAGES` 陣列
- 改造 `src/components/LanguageSwitcher.tsx`：從雙語切換按鈕改為 6 語下拉選單（點擊展開、點擊外部收合、當前語言高亮）
- 更新 `src/App.css`：新增下拉選單樣式（`.lang-switcher-wrap`、`.lang-dropdown`、`.lang-dropdown__item`）
- 更新所有翻譯檔的 `language` 區塊：加入 6 種語言的原生名稱

## Capabilities

### New Capabilities

_無新 capability — 擴充現有 i18n 能力_

### Modified Capabilities

- `i18n`：從雙語（zh-TW/en）擴展為六語（+ja/ko/fr/th），LanguageSwitcher 從按鈕改為下拉選單

## Impact

- `src/locales/`：新增 4 個 JSON 翻譯檔（各約 385 行）
- `src/locales/zh-TW.json`、`en.json`：`language` 區塊擴充
- `src/i18n.ts`：新增 import + SUPPORTED_LANGUAGES export
- `src/components/LanguageSwitcher.tsx`：完全重寫（含 useState/useRef/useEffect）
- `src/App.css`：替換 `.lang-switcher` 樣式 + 新增下拉選單相關樣式
