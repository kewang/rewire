### Requirement: Cable Tie Tightness Mini-Game
玩家點擊束帶放置點時 SHALL 啟動拉緊度小遊戲，以進度條甜蜜區機制決定束帶品質。

#### Scenario: Mini-game activation
- **WHEN** 玩家點擊 available 狀態的束帶放置點
- **THEN** 在放置點旁 inline 展開拉緊度進度條小遊戲

#### Scenario: Progress bar oscillation
- **WHEN** 小遊戲啟動
- **THEN** 進度條指針以 BAR_SPEED=1.0 的速度在 0→1→0 之間來回掃描

#### Scenario: Tap to stop — tight (perfect)
- **WHEN** 玩家在指針位於 0.45-0.55 區間時點擊
- **THEN** 結果為 tight（完美），束帶品質扣分為 0

#### Scenario: Tap to stop — good
- **WHEN** 玩家在指針位於 0.30-0.45 或 0.55-0.70 區間時點擊
- **THEN** 結果為 good（良好），束帶品質扣分為 CABLE_TIE_GOOD_PENALTY(2)

#### Scenario: Tap to stop — loose
- **WHEN** 玩家在指針位於 <0.30 區間時點擊
- **THEN** 結果為 loose（太鬆），束帶品質扣分為 CABLE_TIE_POOR_PENALTY(5)

#### Scenario: Tap to stop — over-tight
- **WHEN** 玩家在指針位於 >0.70 區間時點擊
- **THEN** 結果為 over-tight（過緊），束帶品質扣分為 CABLE_TIE_POOR_PENALTY(5)

#### Scenario: Auto dismiss after result
- **WHEN** 拉緊度結果判定完成
- **THEN** 結果顯示 0.8 秒後小遊戲自動關閉，束帶放置完成

#### Scenario: Remove cable tie
- **WHEN** 玩家點擊已放置束帶的位置
- **THEN** 束帶移除（無小遊戲），恢復 available 狀態

### Requirement: Cable Tie Quality Type
系統 SHALL 定義 CableTieQuality 型別用於表示束帶品質。

#### Scenario: Quality values
- **WHEN** CableTieQuality 型別定義
- **THEN** 包含四個值：'tight' | 'good' | 'loose' | 'over-tight'

### Requirement: Cable Tie Quality Affects Score
束帶品質 SHALL 影響整線分數計算。

#### Scenario: Tight cable tie — no penalty
- **WHEN** 束帶品質為 tight
- **THEN** 該 pair 不扣分

#### Scenario: Good cable tie — minor penalty
- **WHEN** 束帶品質為 good
- **THEN** 該 pair 扣 CABLE_TIE_GOOD_PENALTY(2) 分

#### Scenario: Loose/over-tight cable tie — full penalty
- **WHEN** 束帶品質為 loose 或 over-tight
- **THEN** 該 pair 扣 CABLE_TIE_POOR_PENALTY(5) 分（等同未束帶）

### Requirement: Cable Ties Data Structure
cableTies SHALL 從 `Set<number>` 變更為 `Map<number, CableTieQuality>` 以儲存品質資訊。

#### Scenario: Map stores quality per pair
- **WHEN** 玩家在 pair index 1 完成束帶小遊戲，結果為 good
- **THEN** cableTies.get(1) === 'good'

#### Scenario: Remove updates map
- **WHEN** 玩家移除 pair index 1 的束帶
- **THEN** cableTies.delete(1) 被呼叫
