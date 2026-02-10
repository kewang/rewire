## Context

遊戲所有 UI 文字為繁體中文硬編碼。需要建立國際化框架，支援中英雙語切換。

## Goals / Non-Goals

**Goals:**
- react-i18next 框架設定（語言偵測、localStorage 持久化、fallback）
- 所有元件硬編碼文字抽取為翻譯 key
- zh-TW + en 完整翻譯檔
- 翻譯輔助函式（電器名/房間名/狀態/品質等動態文字）
- LanguageSwitcher 元件（EN/中）

**Non-Goals:**
- 不做自動語言偵測（預設 zh-TW）
- 不做超過中英雙語
- 不做翻譯管理後台

## Decisions

### D1：i18n 庫選擇
**選擇**：react-i18next。
**理由**：React 生態最流行、Hooks 支援好（useTranslation）、bundle size 合理。

### D2：翻譯 key 命名
**選擇**：扁平命名空間，依功能分組（如 `game.status.warning`、`level.L01.name`、`appliance.kettle`）。
**理由**：簡潔直觀，易於維護。

### D3：動態文字處理
**選擇**：建立 i18nHelpers.ts 輔助函式（tApplianceName、tRoomName 等）。
**理由**：電器名、房間名等需要 key 映射，集中處理避免重複邏輯。

### D4：語言切換 UI
**選擇**：LevelSelect 標題旁的簡單按鈕（顯示 EN 或 中）。
**理由**：不干擾遊戲流程，簡潔不突兀。

### D5：GameBoard rAF closure 問題
**選擇**：使用 tRef = useRef(t) 解決 rAF loop 中 t 函式的 closure 問題。
**理由**：rAF callback 中的 t 可能是過期的 closure，需要 ref 確保最新。
