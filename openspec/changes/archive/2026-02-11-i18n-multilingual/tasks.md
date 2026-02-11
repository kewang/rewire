## 1. 翻譯檔建立

- [x] 1.1 建立 `src/locales/ja.json` — 完整日文翻譯（含所有 key + 28 關卡 + 隨機老屋 + language 區塊）
- [x] 1.2 建立 `src/locales/ko.json` — 完整韓文翻譯
- [x] 1.3 建立 `src/locales/fr.json` — 完整法文翻譯
- [x] 1.4 建立 `src/locales/th.json` — 完整泰文翻譯

## 2. 現有翻譯檔更新

- [x] 2.1 更新 `src/locales/zh-TW.json` 的 `language` 區塊，加入 ja/ko/fr/th 語言名稱
- [x] 2.2 更新 `src/locales/en.json` 的 `language` 區塊，加入 ja/ko/fr/th 語言名稱

## 3. i18n 配置更新

- [x] 3.1 更新 `src/i18n.ts`：import 4 個新翻譯檔，加入 resources 註冊
- [x] 3.2 在 `src/i18n.ts` export `SUPPORTED_LANGUAGES` 陣列（6 種語言 code + label）

## 4. LanguageSwitcher 改造

- [x] 4.1 重寫 `src/components/LanguageSwitcher.tsx`：下拉選單 UI（useState open + useRef + useEffect click-outside）
- [x] 4.2 更新 `src/App.css`：替換 `.lang-switcher` 樣式，新增 `.lang-switcher-wrap`、`.lang-dropdown`、`.lang-dropdown__item` 等下拉選單樣式

## 5. 驗證

- [x] 5.1 `npm run build` 確認編譯通過
- [x] 5.2 手動測試 6 種語言切換，確認所有 UI 文字正確顯示
