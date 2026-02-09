## Context

LevelSelect 元件目前使用 `flex-direction: column` 單欄佈局，容器 `max-width: 640px`。17 個關卡全部堆疊，在桌面螢幕上需要大幅捲動。每張卡片顯示名稱、描述、電器清單、預算/通電目標四行資訊。

## Goals / Non-Goals

**Goals:**
- 關卡卡片改為 CSS Grid 多欄排列，減少捲動距離
- 桌面版一眼可看到大部分或全部關卡
- 響應式：不同螢幕寬度自動調整欄數
- 維持現有視覺風格（工業深色主題、卡片邊框、hover 特效）

**Non-Goals:**
- 不改變關卡資料結構或 Level type
- 不增加關卡分類/篩選功能
- 不改變卡片互動行為（點擊進入關卡）

## Decisions

### D1: 使用 CSS Grid `auto-fill` + `minmax()`

用 `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))` 讓瀏覽器根據容器寬度自動計算欄數。

**理由**：比 media query 指定固定欄數更靈活，一行 CSS 即可處理所有螢幕寬度。260px 最小寬度可確保卡片內容不會過於擁擠。

**替代方案**：media query 分段指定 `grid-template-columns`（1/2/3/4 欄）—— 更繁瑣但可精確控制。此變更不需要精確控制，`auto-fill` 足矣。

### D2: 容器寬度放寬至 1200px

現有 `max-width: 640px` 只能容納一欄。放寬至 1200px 讓桌面版可顯示 3-4 欄。

### D3: 卡片內容精簡

Grid 佈局下每張卡片較窄，保留現有四行資訊但允許文字截斷（`overflow: hidden`，`text-overflow: ellipsis`）以維持卡片高度一致。

## Risks / Trade-offs

- [卡片高度不一致] → 使用 grid 自動等高行為（同一 row 內所有卡片自動等高）
- [長電器名稱溢出] → 電器列表超出時以 ellipsis 截斷
