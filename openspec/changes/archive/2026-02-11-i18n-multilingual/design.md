## Context

目前 i18n 架構支援 zh-TW 與 en 雙語，使用 react-i18next + localStorage 持久化。LanguageSwitcher 是簡單的雙語切換按鈕。需要擴展為六語並升級切換介面。

## Goals / Non-Goals

**Goals:**
- 新增日文(ja)、韓文(ko)、法文(fr)、泰文(th) 完整翻譯
- i18n.ts 註冊新語言資源，export SUPPORTED_LANGUAGES 供 LanguageSwitcher 使用
- LanguageSwitcher 改為多語下拉選單（點擊展開/收合、點擊外部收合、當前語言高亮）
- 所有翻譯檔 `language` 區塊包含 6 種語言名稱

**Non-Goals:**
- 不做自動語言偵測（navigator.language）
- 不做翻譯品質校對系統
- 不做 lazy-loading 翻譯檔（bundle size 尚可接受）
- 不新增 i18nHelpers 函式（現有 helper 已足夠）

## Decisions

### 1. 翻譯檔結構：完整複製 + 本地化

每個新語言複製 zh-TW.json 的完整 key 結構，所有 value 翻譯為目標語言。

**替代方案**：只翻譯部分 key，fallback 到 zh-TW → 不可接受，混合語言的 UX 很差。

### 2. SUPPORTED_LANGUAGES 放在 i18n.ts

語言列表 export 為 `as const` 陣列，LanguageSwitcher 直接 import 使用。

**替代方案**：放在 constants.ts → 但語言列表與 i18n 初始化強耦合，放在一起更內聚。

### 3. LanguageSwitcher 用原生 DOM 下拉選單

自建 dropdown（div + ul），不用 `<select>`。好處是可完全控制樣式、匹配工業深色主題。使用 `pointerdown` 事件偵測點擊外部收合。

**替代方案**：原生 `<select>` → 樣式受限，跨瀏覽器不一致。

### 4. 電氣術語翻譯策略

- NFB / ELCB：各語言保留英文縮寫（國際通用），但輔以本地化說明文字
- 日文：使用日本電氣工事標準用語（分電盤、圧着端子、漏電遮断器）
- 韓文：使用韓國電氣工程用語（분전반、압착 단자、누전 차단기）
- 法文：使用法國電氣規範用語（tableau électrique、DDR = dispositif différentiel résiduel）
- 泰文：使用泰國電力行業用語（ตู้สวิตช์บอร์ด、หางปลา、เครื่องตัดไฟรั่ว）

## Risks / Trade-offs

- **翻譯品質**：機器翻譯可能有不精確的電氣術語 → 可後續由母語者校對
- **Bundle size 增加**：4 個新 JSON 檔（各 ~8KB）→ 約增加 32KB gzip 前，可接受
- **缺少 RTL 支援**：目前 6 種語言都是 LTR，暫不需處理 → 若未來加阿拉伯語需額外處理
