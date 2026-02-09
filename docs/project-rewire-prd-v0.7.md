# PRD v0.7 — Project Rewire（配電盤燒線 Demo / 完整老屋驚魂版）

## 0. 版本摘要

v0.7 建立在 v0.6 已完成的基礎上（23 關、10 電器、6 線材、壓接端子、三星評分、走線整理、配電箱內部視圖），聚焦一個方向：
1. **完整老屋驚魂模式（FR-I）** — 擴充老屋問題類型至 5 種、引入 NFB 更換機制、Before/After 修復對比、隨機老屋生成器，讓「老屋驚魂」從 v0.5 的 3 關預覽版進化為完整的遊戲模式

> v0.1–v0.6 所有功能需求維持不變，本文件僅描述 **增量（delta）** 內容。


## 1. 產品目標（This release）

在 v0.6 的基礎上：
1. 擴充老屋問題類型至 5 種，涵蓋更全面的配電安全知識（NFB 規格匹配、漏電保護）
2. 引入 NFB 更換機制，讓玩家第一次能「選擇斷路器規格」，理解 NFB 與線材的匹配關係
3. 新增 Before/After 修復對比視覺，給予修復完成的成就感與教育回饋
4. 推出隨機老屋生成器，提供無限重玩性
5. 老屋模式整合走線整理，體驗「修復 + 整線」的完整翻修流程
6. 新增固定關卡 L24–L28，漸進引入新問題類型並綜合所有機制

### 非目標（Not in v0.7）
- 不做線標系統（延至 v0.8）
- 不做整線影響電氣功能（延至 v0.8）
- 不做弱電 / 網路
- 不做全室拉線物理模擬
- 不做 NFB 成本模型（更換免費，聚焦「選對規格」的教育意義）
- 不做隨機老屋的星等追蹤（僅計通關次數）


## 2. 功能需求（Functional Requirements）

### FR-I-A：新增問題類型

v0.5 已實作 3 種老屋問題（bare-wire、wrong-wire-gauge、oxidized-splice），v0.7 新增 2 種，總計 5 種。

#### `overrated-breaker` — NFB 規格過大

**情境：** 老屋配電箱中，某迴路的 NFB 額定電流遠超線材安全電流。例如 30A NFB 保護 2.0mm²（20A）線材——線材過載時 NFB 不會跳脫，線材直接燒毀。

**為什麼危險：**
- NFB 的作用是在電流超過線材承受力之前跳脫保護
- NFB 額定電流應 ≤ 線材安全電流
- 過大的 NFB = 沒有保護 = 火災風險

**遊戲效果：**
- 問題迴路的 NFB 規格過大（`breaker.ratedCurrent > wire.maxCurrent`）
- 若不修復直接送電，電器負載可能超過線材容量但低於 NFB 跳脫閾值 → 線材直接燒毀
- 視覺標示：NFB 上方顯示 ⚠️ + 紅色邊框

**修復方式：**
- 玩家使用 NFB 規格選擇器，將 NFB 更換為正確規格
- 修復條件：新 NFB 的 `ratedCurrent ≤ wire.maxCurrent`（考慮當前線材，若玩家也換了線則用新線）
- **不需要拆線**（與前 3 種問題不同）

**教育意義：** NFB 不是越大越好，必須匹配線材承受力。


#### `missing-elcb` — 潮濕區缺漏電保護

**情境：** 浴室、廚房等潮濕區域的迴路未安裝 ELCB（漏電斷路器），一旦漏電就是觸電事故。

**為什麼危險：**
- 潮濕環境容易產生漏電（水 = 導體）
- ELCB 能在 30mA 漏電時瞬間切斷電源保命
- 沒有 ELCB 的潮濕迴路 = 觸電風險

**遊戲效果：**
- 問題迴路為 wetArea 但未安裝 ELCB
- 若不修復直接送電，漏電事件會觸發 `leakage`（severity=3，即時失敗）
- 視覺標示：迴路旁顯示 💧⚠️（潮濕+警告）

**修復方式：**
- 玩家點擊 ELCB 開關安裝 ELCB（使用既有 ELCB toggle 機制）
- 修復條件：`circuitElcb[circuitId] === true`
- **不需要拆線**
- ELCB 成本 $35 計入總成本（與既有機制一致）

**教育意義：** 潮濕區域必須裝 ELCB，這是法規要求也是保命必要。


#### 問題類型總覽（5 種）

| # | 問題類型 | 名稱 | 效果 | 修復方式 | 需拆線 | 新增/既有 |
|---|----------|------|------|----------|--------|-----------|
| 1 | `bare-wire` | 沒壓端子 | contactResistance=1.5 | 拆線→重接+壓接 | ✓ | v0.5 |
| 2 | `wrong-wire-gauge` | 線徑過小 | 線材容量不足 | 拆線→換線+壓接 | ✓ | v0.5 |
| 3 | `oxidized-splice` | 氧化接點 | contactResistance=2.0 | 拆線→重接+壓接 | ✓ | v0.5 |
| 4 | `overrated-breaker` | NFB 過大 | NFB 無法保護線材 | 更換正確 NFB | ✗ | **v0.7 新增** |
| 5 | `missing-elcb` | 缺漏電保護 | 漏電即觸電 | 安裝 ELCB | ✗ | **v0.7 新增** |

**設計亮點：** 新問題類型引入不同的修復流程（不需拆線），增加遊戲多樣性。玩家需判斷「這個問題要拆線重做，還是調整設定就好」。


### FR-I-B：NFB 更換機制

新增 NFB 規格選擇 UI，讓玩家第一次能在遊戲中更換斷路器。

#### 資料模型

GameBoard 新增狀態：
- `circuitBreakers: Record<CircuitId, Breaker>` — 各迴路當前 NFB 規格
- 初始化時從 `CircuitConfig.breaker` 載入
- 老屋模式中，overrated-breaker 迴路的初始 NFB 故意過大

#### UI 互動

**觸發時機：** 老屋模式中，有 `overrated-breaker` 問題的迴路。

**互動流程：**
1. CircuitDiagram 中，問題迴路的 NFB 顯示 ⚠️ + 紅色邊框
2. 點擊 NFB → 彈出 NFB 選擇器（15A / 20A / 30A）
3. 當前安裝的規格標示「目前」，不可重複選擇
4. 選擇新規格 → NFB 更換動畫（拆下→裝上）
5. 若新規格正確（ratedCurrent ≤ 線材 maxCurrent）→ ⚠️ 消失，問題解決
6. 若仍不正確 → ⚠️ 保持，可再次更換

**NFB 選擇器視覺：**
- 三個選項卡片（15A / 20A / 30A），與 WireSelector 風格一致
- 每個選項顯示：額定電流、跳脫閾值（×1.25）
- 與當前線材相容的選項標示 ✓，不相容的標示 ⚠️

**成本：** NFB 更換免費（端子、束帶同理——聚焦「選對」而非「付錢」）。

**驗收條件：**
- 老屋 overrated-breaker 迴路可開啟 NFB 選擇器
- 選擇正確規格後問題消除
- 選擇仍不正確的規格，問題保持
- NFB 更換不影響已接的線材和壓接
- 非 overrated-breaker 迴路不可更換 NFB


### FR-I-C：Before/After 修復對比

老屋修復完成後，展示修復前後的視覺對比，作為通關獎勵與教育回饋。

#### 快照機制

**修復前快照（Before Snapshot）：**
- 進入老屋關卡時自動擷取初始狀態
- 記錄：問題清單、各迴路線材/壓接/NFB 規格/ELCB 狀態
- 存於 GameBoard state（不需持久化）

**修復後狀態（After State）：**
- 送電驗證成功後，從當前 GameBoard state 取得

#### 視覺呈現

**Before/After 面板：**
- 在 ResultPanel 下方新增區塊，僅老屋關卡且通關時顯示
- 左右並排佈局（桌面）或上下佈局（手機）
- 左側「修復前」：問題迴路紅色高亮 + 問題圖示 + 舊線材色
- 右側「修復後」：全綠 ✓ + 新線材色 + 正確 NFB + ELCB 盾牌
- 中間滑桿可拖曳切換（桌面版，可選）

**修復摘要文字：**
- 列出每個已修復的問題及修復方式
- 例：「✓ c1 廚房：更換 NFB 30A → 20A」
- 例：「✓ c2 浴室：安裝漏電斷路器（ELCB）」
- 例：「✓ c3 客廳：拆除氧化接點，重新接線 + 壓接」

**動畫：**
- Before → After 漸變過渡（opacity transition）
- 問題圖示消失動畫（fade + scale down）
- ✓ 圖示出現動畫（pop in）

**驗收條件：**
- 老屋關卡通關後顯示 Before/After 對比
- 非老屋關卡不顯示此區塊
- 問題摘要文字正確反映各問題的修復方式
- 響應式：桌面左右並排、手機上下堆疊


### FR-I-D：隨機老屋生成器

程序化生成隨機老屋關卡，提供無限重玩性。

#### 隨機生成引擎

新增 `src/engine/randomOldHouse.ts`，純函式生成器：

```typescript
function generateRandomOldHouse(difficulty: 1 | 2 | 3): Level
```

**難度定義：**

| 難度 | 迴路數 | 問題數 | 可用問題類型 | 額外機制 |
|------|--------|--------|-------------|----------|
| 1（初級） | 2–3 | 1–2 | bare-wire, wrong-wire-gauge, oxidized-splice | 無 |
| 2（中級） | 3–4 | 2–3 | 全 5 種 | 手動相位 |
| 3（高級） | 4–6 | 3–5 | 全 5 種 | 手動相位 + 漏電 + 整線 |

**生成演算法：**
1. **迴路數量**：依難度隨機選取
2. **電壓分配**：至少 1 個 110V；難度 2+ 可能有 220V；難度 3 可能有 wetArea
3. **線材分配**：依電器負載合理選取（或故意選錯作為 wrong-wire-gauge 問題）
4. **NFB 分配**：正常迴路選正確 NFB；overrated-breaker 迴路故意選過大
5. **電器分配**：從電器池隨機選取，確保負載合理
6. **問題分配**：隨機選取迴路 + 問題類型，同一迴路最多 1 個問題
7. **預算計算**：正確修復所需成本 × 1.3（留 30% 彈性）
8. **存活時間**：10 + 難度 × 3 秒

**確保可解性：**
- 生成後驗證：至少存在一個合法的修復方案，使所有迴路安全運作
- 預算足以覆蓋最低成本修復方案
- 電器負載不會在正確線材下立即燒毀

#### LevelSelect UI 擴充

**新增區塊：「🏚️ 隨機老屋挑戰」**
- 位於固定關卡 grid 下方
- 三張難度卡片：初級 / 中級 / 高級
- 每張卡片顯示：
  - 難度名稱 + 圖示
  - 難度說明（迴路數、問題數範圍）
  - 歷史通關次數（如「已通關 5 次」）
- 點擊卡片 → 生成隨機關卡 → 進入遊戲

**通關紀錄：**
- localStorage key：`rewire-random-completions`
- value：`Record<string, number>`（difficulty → completion count）
- 不追蹤星等（隨機關卡每次不同，星等沒有比較意義）

**驗收條件：**
- LevelSelect 顯示隨機老屋區塊
- 三個難度可正常生成並遊玩
- 每次生成的關卡不同
- 生成的關卡必定可解
- 通關次數正確記錄並顯示


### FR-I-E：老屋 + 走線整合

v0.6 的走線整理系統整合進老屋模式，讓高難度老屋關卡需要修復 + 整線的完整翻修流程。

**整合規則：**
- Level 可同時設定 `oldHouse` + `requiresRouting: true`
- 遊戲流程：檢查問題 → 修復（拆線/換線/換 NFB/裝 ELCB）→ 整線 → 送電
- 整線階段在所有問題修復 + 所有迴路接線完成後才可進入
- 整線評分與星等照常計算

**送電前置條件更新：**
- 所有迴路已接線 ✓
- 所有壓接完成（若 requiresCrimp）✓
- 所有問題已修復 ✓
- ELCB 已安裝（所有 wetArea 迴路）✓
- 已完成整線（若 requiresRouting）✓

**L27–L28 使用此整合。**

**驗收條件：**
- oldHouse + requiresRouting 關卡中，修復完成後出現「整線」按鈕
- 整線流程與 L21–L23 一致
- 整線分數正確影響星等
- 修復階段不可進入整線（問題未全修復時「整線」按鈕 disabled）


## 3. 更新後的完整數據表

### 線材（6 種，不變）

（同 v0.6）

### 電器（10 種，不變）

（同 v0.6）

### 壓接端子（2 種，不變）

（同 v0.5）

### NFB（3 種，不變，新增更換機制）

| 規格 | 額定電流 | 跳脫閾值（×1.25） | 適用線徑 | 更換成本 |
|------|----------|-------------------|----------|----------|
| 15A | 15A | 18.75A | 1.6mm²（15A） | 免費 |
| 20A | 20A | 25.0A | 2.0mm²（20A） | 免費 |
| 30A | 30A | 37.5A | 3.5mm²+（25A+） | 免費 |

### 老屋問題（5 種，新增 2 種）

| 問題 | 效果 | 修復方式 | 需拆線 |
|------|------|----------|--------|
| bare-wire | contactResistance=1.5 | 拆線+重接+壓接 | ✓ |
| wrong-wire-gauge | 線材容量不足 | 拆線+換線+壓接 | ✓ |
| oxidized-splice | contactResistance=2.0 | 拆線+重接+壓接 | ✓ |
| **overrated-breaker** | **NFB 不保護線材** | **更換正確 NFB** | **✗** |
| **missing-elcb** | **漏電即觸電** | **安裝 ELCB** | **✗** |

### 隨機老屋生成參數

| 難度 | 迴路數 | 問題數 | 問題池 | 額外機制 | 存活時間 |
|------|--------|--------|--------|----------|----------|
| 初級 | 2–3 | 1–2 | 前 3 種 | 無 | 13 秒 |
| 中級 | 3–4 | 2–3 | 全 5 種 | 手動相位 | 16 秒 |
| 高級 | 4–6 | 3–5 | 全 5 種 | 相位+漏電+整線 | 19 秒 |


## 4. 新關卡設計（L24–L28）

### L24 老屋驚魂：保護力缺失
- **電器**：快煮壺 (1500W/110V) + 冰箱 (200W/110V) + 吹風機 (1200W/110V)
- **預算**：$120
- **存活時間**：10 秒
- **requiresCrimp**：true
- **迴路配置**：
  - c1「廚房」110V / **30A NFB** — 可用：快煮壺
  - c2「客廳」110V / 20A NFB — 可用：吹風機、冰箱
  - c3「儲藏室」110V / 15A NFB — 可用：冰箱
- **老屋問題**：
  - c1：`overrated-breaker`（30A NFB 保護 2.0mm² 線材，NFB 過大）
  - c2：`bare-wire`（沒壓端子）
- **預接狀態**：
  - c1：已接 2.0mm² + crimpQuality='good' + [快煮壺]（線材沒問題，NFB 太大）
  - c2：已接 2.0mm² + crimpQuality='none' + [吹風機]
  - c3：已接 1.6mm² + crimpQuality='excellent' + [冰箱]（正常）
- **設計意圖**：首次體驗 `overrated-breaker`。c1 的線和電器都沒問題，但 30A NFB 保護不了 20A 線材——若未來負載增加（或本關微波也接上），線材會在 NFB 跳脫前燒毀。玩家需要將 c1 的 NFB 從 30A 換成 20A。c2 是複習 bare-wire 拆線重接。c3 正常不用修
- **修復策略**：c1 換 NFB（30A→20A，免費）+ c2 拆線重接 2.0mm²($50) + 壓接
- **成本**：c2 新線 $50 ≤ $120 ✓
- **危險場景**：若不換 NFB 就送電，快煮壺 13.6A < 20A 線材安全，「看起來沒事」——但 NFB 跳脫要到 37.5A，遠超線材承受力。此關電流安全但問題被標記，教育玩家預防觀念
- **第三星**：`{ type: 'no-warning' }`

### L25 老屋驚魂：潮濕陷阱
- **電器**：浴室暖風機 (1650W/220V) + 吹風機 (1200W/110V) + 冰箱 (200W/110V)
- **預算**：$170
- **存活時間**：12 秒
- **requiresCrimp**：true
- **漏電模式**：random
- **迴路配置**：
  - c1「浴室」220V / 20A NFB / **wetArea** / elcbAvailable — 可用：浴室暖風機
  - c2「客廳」110V / 20A NFB — 可用：吹風機
  - c3「儲藏室」110V / 15A NFB — 可用：冰箱
- **老屋問題**：
  - c1：`missing-elcb`（浴室潮濕區未裝 ELCB）
  - c2：`oxidized-splice`（氧化接點）
- **預接狀態**：
  - c1：已接 2.0mm² + crimpQuality='good' + [浴室暖風機]（線材沒問題，缺 ELCB）
  - c2：已接 2.0mm² + crimpQuality='none' + [吹風機]（氧化接觸）
  - c3：已接 1.6mm² + crimpQuality='excellent' + [冰箱]（正常）
- **設計意圖**：首次體驗 `missing-elcb`。c1 浴室線材和壓接都沒問題，但缺 ELCB——有漏電就是觸電。玩家需安裝 ELCB。c2 氧化接點需拆線重接。隨機漏電事件讓 ELCB 的重要性變得切身
- **修復策略**：c1 安裝 ELCB($35) + c2 拆線重接 2.0mm²($50) + 壓接
- **成本**：$35 + $50 = $85 ≤ $170 ✓
- **危險場景**：不裝 ELCB → 漏電事件 → 觸電（leakage, severity=3）即時失敗
- **第三星**：`{ type: 'no-trip' }`

### L26 老屋驚魂：五毒俱全
- **電器**：快煮壺 (1500W/110V) + 微波爐 (1100W/110V) + 浴室暖風機 (1650W/220V) + 冰箱 (200W/110V) + 吹風機 (1200W/110V)
- **預算**：$280
- **存活時間**：15 秒
- **requiresCrimp**：true
- **漏電模式**：random
- **相位模式**：manual
- **迴路配置**：
  - c1「廚房」110V / **30A NFB** / 預設 R 相 — 可用：快煮壺、微波爐
  - c2「浴室」220V / 20A NFB / **wetArea** / elcbAvailable — 可用：浴室暖風機
  - c3「客廳」110V / 20A NFB / 預設 R 相 — 可用：吹風機
  - c4「儲藏室」110V / 15A NFB / 預設 T 相 — 可用：冰箱
- **老屋問題**：
  - c1：`overrated-breaker`（30A NFB 保護 1.6mm² 線材）+ `wrong-wire-gauge`（1.6mm² 不夠）
  - c2：`missing-elcb`（浴室缺 ELCB）
  - c3：`oxidized-splice`（氧化接點）
  - c4：`bare-wire`（沒壓端子）
- **預接狀態**：
  - c1：已接 1.6mm² + crimpQuality='poor' + [快煮壺, 微波爐]（線太細 + NFB 太大）
  - c2：已接 2.0mm² + crimpQuality='good' + [浴室暖風機]（缺 ELCB）
  - c3：已接 2.0mm² + crimpQuality='none' + [吹風機]（氧化）
  - c4：已接 1.6mm² + crimpQuality='none' + [冰箱]（裸線）
- **設計意圖**：全 5 種問題類型登場的「診斷大師」關卡。c1 同時有兩個問題（線太細 + NFB 太大），需要換線 + 換 NFB。c2 只需裝 ELCB。c3/c4 是拆線重接。相位需手動平衡（c1+c3 預設都是 R 相，需切 c3 到 T 相）
- **修復策略**：
  - c1：拆線→換 3.5mm²($80) + 壓接 + NFB 換 20A
  - c2：安裝 ELCB($35)
  - c3：拆線→重接 2.0mm²($50) + 壓接
  - c4：拆線→重接 1.6mm²($30) + 壓接
- **成本**：$80 + $35 + $50 + $30 = $195 ≤ $280 ✓
- **相位**：切 c3 到 T 相。R: c1(快煮壺13.6+微波10.0=23.6A), T: c3(吹風機10.9A) → I_N=|23.6-10.9|=12.7A < 30A ✓
- **第三星**：`{ type: 'no-warning' }`

### L27 老屋驚魂：翻修 + 整線
- **電器**：快煮壺 (1500W/110V) + 吹風機 (1200W/110V) + 冰箱 (200W/110V) + 冷氣 (2800W/220V)
- **預算**：$280
- **存活時間**：12 秒
- **requiresCrimp**：true
- **requiresRouting**：true
- **相位模式**：manual
- **迴路配置**：
  - c1「廚房」110V / 20A NFB / 預設 R 相 — 可用：快煮壺
  - c2「客廳」110V / **30A NFB** / 預設 R 相 — 可用：吹風機、冰箱
  - c3「客廳冷氣」220V / 20A NFB — 可用：冷氣
  - c4「儲藏室」110V / 15A NFB / 預設 T 相 — 可用：冰箱
- **老屋問題**：
  - c1：`bare-wire`（沒壓端子）
  - c2：`overrated-breaker`（30A NFB 保護 2.0mm² 線材）
- **預接狀態**：
  - c1：已接 2.0mm² + crimpQuality='none' + [快煮壺]
  - c2：已接 2.0mm² + crimpQuality='good' + [吹風機]
  - c3：已接 2.0mm² + crimpQuality='excellent' + [冷氣]（正常）
  - c4：已接 1.6mm² + crimpQuality='excellent' + [冰箱]（正常）
- **初始車道排列**：['c1', 'c3', 'c4', 'c2']（故意製造交叉）
- **設計意圖**：首次「修復 + 整線」整合關卡。問題不多（2 個），重點在修復後還要進入配電箱整理走線。4 迴路走線需要排列 + 束帶。相位需平衡（c1+c2 都是 R 相，需切 c2 到 T）
- **修復策略**：c1 拆線重接 + 壓接；c2 換 NFB（30A→20A）。然後進入整線：重排車道消除交叉 + 放束帶
- **成本**：c1 新線 2.0mm²($50) ≤ $280 ✓
- **第三星**：`{ type: 'aesthetics-score', minScore: 80 }`

### L28 老屋驚魂：終極考驗
- **電器**：快煮壺 (1500W/110V) + 微波爐 (1100W/110V) + 吹風機 (1200W/110V) + 浴室暖風機 (1650W/220V) + 冷氣 (2800W/220V) + 冰箱 (200W/110V)
- **預算**：$380
- **存活時間**：15 秒
- **requiresCrimp**：true
- **requiresRouting**：true
- **相位模式**：manual
- **漏電模式**：random
- **迴路配置**：
  - c1「廚房」110V / **30A NFB** / 預設 R 相 — 可用：快煮壺、微波爐
  - c2「客廳」110V / 20A NFB / 預設 R 相 — 可用：吹風機
  - c3「浴室」220V / 20A NFB / **wetArea** / elcbAvailable — 可用：浴室暖風機
  - c4「客廳冷氣」220V / 20A NFB — 可用：冷氣
  - c5「儲藏室」110V / 15A NFB / 預設 T 相 — 可用：冰箱
- **老屋問題**：
  - c1：`wrong-wire-gauge`（1.6mm² 太細）+ `overrated-breaker`（30A NFB）
  - c2：`oxidized-splice`（氧化接點）
  - c3：`missing-elcb`（浴室缺 ELCB）
  - c5：`bare-wire`（沒壓端子）
- **預接狀態**：
  - c1：已接 1.6mm² + crimpQuality='poor' + [快煮壺, 微波爐]
  - c2：已接 2.0mm² + crimpQuality='none' + [吹風機]
  - c3：已接 2.0mm² + crimpQuality='good' + [浴室暖風機]
  - c4：已接 2.0mm² + crimpQuality='excellent' + [冷氣]（正常）
  - c5：已接 1.6mm² + crimpQuality='none' + [冰箱]
- **初始車道排列**：['c1', 'c4', 'c2', 'c3', 'c5']（多交叉）
- **設計意圖**：v0.7 畢業考。5 迴路 + 4 個問題（含雙重問題迴路）+ 手動相位 + 漏電 + 整線 = 全機制綜合。玩家需要：(1) 診斷所有問題 (2) 修復（換線+換NFB+裝ELCB+拆線重接）(3) 切相平衡 (4) 整線排列 (5) 存活 15 秒。難度最高的固定老屋關卡
- **修復策略**：
  - c1：拆線→換 3.5mm²($80) + 壓接 + NFB 換 20A
  - c2：拆線→重接 2.0mm²($50) + 壓接
  - c3：安裝 ELCB($35)
  - c5：拆線→重接 1.6mm²($30) + 壓接
- **成本**：$80 + $50 + $35 + $30 = $195 ≤ $380 ✓（留大量彈性給不同線徑策略）
- **相位**：切 c2 到 T 相。R: c1(23.6A), T: c2(10.9A) → I_N=12.7A < 30A ✓
- **第三星**：`{ type: 'under-budget-ratio', ratio: 0.7 }`（成本 ≤ $266，鼓勵精打細算）


## 5. 關鍵設計決策摘要

| 決策 | 選擇 | 理由 |
|------|------|------|
| 新增 2 種問題類型 | overrated-breaker + missing-elcb | 不需拆線的修復方式增加多樣性，且教育價值高 |
| NFB 更換免費 | 不計成本 | 與端子、束帶一致——聚焦「選對」而非「付錢」 |
| NFB 選擇器限老屋 overrated-breaker | 非老屋不可換 NFB | 避免正常關卡增加不必要複雜度 |
| overrated-breaker 判定 | ratedCurrent > wire.maxCurrent | 簡潔、物理意義明確 |
| missing-elcb 修復 = 安裝 ELCB | 重用既有 ELCB toggle | 零新 UI，教育效果好 |
| Before/After 為 inline 區塊 | ResultPanel 下方 | 不遮蓋其他結果資訊，自然閱讀流 |
| 隨機老屋 3 級難度 | 初/中/高 | 與固定關卡的漸進難度呼應，重玩動機明確 |
| 隨機老屋不追蹤星等 | 僅計通關次數 | 每次關卡不同，星等無比較意義 |
| 隨機生成驗證可解性 | 生成後驗算 | 避免死局，保證遊戲體驗 |
| 老屋 + 整線整合 | requiresRouting 可與 oldHouse 共存 | 自然擴展，翻修體驗完整 |
| 新關卡 5 關 | L24–L28 | 每新問題類型各一入門關 + 綜合關 + 整線整合關 + 畢業考 |
| 同迴路可有多問題 | c1 可同時 wrong-wire-gauge + overrated-breaker | 真實情境中問題常共存 |


## 6. 向後相容性

- L01–L23 不受影響：無新問題類型、NFB 選擇器不出現
- `OldHouseProblemType` 擴充：新增 `'overrated-breaker' | 'missing-elcb'`
- `OldHouseProblem` 介面不變（circuitId + type，不需額外欄位）
- `Level` 無新欄位（`oldHouse` + `requiresRouting` 已存在，組合使用）
- GameBoard 新增 state：`circuitBreakers: Record<CircuitId, Breaker>`
- `problemCircuits` 解決邏輯擴充：除了拆線重接，新增 NFB 更換和 ELCB 安裝的解決路徑
- 新增元件/檔案：
  - `src/engine/randomOldHouse.ts` — 隨機老屋生成器
  - `src/components/BreakerSelector.tsx` — NFB 選擇器 UI
  - `src/components/BeforeAfterView.tsx` — Before/After 對比 UI
- ResultPanel 新增 Before/After 區塊（僅老屋關卡觸發）
- LevelSelect 新增隨機老屋區塊
- localStorage 新增 key：`rewire-random-completions`


## 7. 實作順序

| 順序 | Change 名稱 | 範圍 | 依賴 |
|------|------------|------|------|
| 1 | `new-old-house-problems` | OldHouseProblemType 擴充 + NFB 更換機制（BreakerSelector + GameBoard circuitBreakers state + 問題解決邏輯）+ missing-elcb 解決邏輯 + L24–L25 | 無 |
| 2 | `before-after-view` | Before/After 快照機制 + BeforeAfterView 元件 + ResultPanel 整合 + 修復摘要文字 | Change 1 |
| 3 | `old-house-routing-integration` | oldHouse + requiresRouting 整合 + L26–L28 關卡定義（含多問題迴路 + 整線整合） | Change 1 |
| 4 | `random-old-house` | randomOldHouse.ts 生成器 + LevelSelect 隨機老屋 UI + 通關次數紀錄 | Change 1, 3 |


## 8. 後續版本方向（Roadmap Preview）

- **v0.8**：整線進階（線標系統 + 整線影響電氣功能 + 更多走線工具）
- **v1.0**：弱電箱與網路系統模擬
