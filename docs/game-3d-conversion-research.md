# Rewire 3D 轉換研究報告

> 研究目標：評估將 Rewire（2D SVG/Web 配電盤模擬器）轉換為 3D 遊戲的技術可行性、工具鏈、與實作路線。

---

## 目錄

1. [Godot 4 glTF Import Workflow（Blender → Godot）](#1-godot-4-gltf-import-workflow)
2. [照片轉 PBR 材質 — 免費工具](#2-照片轉-pbr-材質--免費工具)
3. [Godot 4 電氣模擬遊戲案例](#3-godot-4-電氣模擬遊戲案例)
4. [Blender 配電盤 / NFB 斷路器建模](#4-blender-配電盤--nfb-斷路器建模)
5. [Godot 4 大型專案結構](#5-godot-4-大型專案結構)
6. [Rewire 轉換策略建議](#6-rewire-轉換策略建議)

---

## 1. Godot 4 glTF Import Workflow

### 推薦格式：glTF 2.0 (.glb)

Blender Studio 團隊（曾用 Blender + Godot 製作完整遊戲）選擇 glTF 2.0 而非直接匯入 .blend，理由：
- Blender 和 Godot 對 glTF 都有原生支援（材質、動畫、自訂 mesh 資料）
- 明確匯出步驟區分工作檔與遊戲資產
- 直接匯入 .blend 內部也是走 glTF，手動匯出反而更可控

### Blender 匯出設定

1. 選取 mesh + armature
2. File > Export > glTF 2.0 (.glb/.gltf)
3. Include：勾選 **Selected Objects**
4. 動畫：勾選 **NLA Strips**，取消勾選 **Export all animation actions**（避免匯出未使用的測試動作）
5. 格式選 glTF Binary (.glb) 最方便（單一檔案）

### 關鍵注意事項

| 項目 | 說明 |
|------|------|
| **PBR 材質** | 使用 Principled BSDF 可直接轉換；非標準 shader node 不會傳輸 |
| **動畫** | 用 Blender NLA Editor，Push actions 到 NLA strips 並命名 → 對應 Godot 動畫名稱 |
| **碰撞形狀** | 不會自動傳輸。使用 [Blender to Godot 4 Pipeline Addon](https://michaeljared.itch.io/blender-to-godot-4-pipeline-addon)（支援 Blender 4.2-5.0）設定碰撞、NavMesh |
| **比例** | Blender 預設公尺，Godot 也用公尺，保持一致即可 |
| **多資產** | 使用 Blender export collections 從單一 .blend 匯出個別資產 |

### 參考資源

- [Blender Studio: Our Workflow with Blender and Godot](https://studio.blender.org/blog/our-workflow-with-blender-and-godot/)
- [Best Workflow for Exporting Animated Characters](https://supermatrix.studio/blog/best-workflow-for-exporting-animated-characters-from-blender-to-godot)
- [Blender to Godot 4 Pipeline Addon](https://michaeljared.itch.io/blender-to-godot-4-pipeline-addon)

---

## 2. 照片轉 PBR 材質 — 免費工具

### 瀏覽器端（免安裝）

| 工具 | 產生的貼圖 | 說明 |
|------|-----------|------|
| **[AITextured.com](https://aitextured.com/pbr-texture-generator/)** | Normal, Roughness, Height, AO, Metallic | 免費、4K、可平鋪 |
| **[GenPBR](https://genpbr.com/)** | 完整 PBR 組 | 客戶端處理（圖片不離開本機），匯出 ZIP 或 MaterialX (.mtlx) |

### 桌面應用程式（免費）

| 工具 | 平台 | 說明 |
|------|------|------|
| **[Materialize](http://www.boundingboxsoftware.com/materialize/)** | Windows | 開源，從單張照片生成 height/metallic/smoothness/normal/edge/AO，滑桿微調，即時 3D 預覽 |
| **[ArmorLab](https://armorlab.org/)** | Win/Mac/Linux | AI 驅動，拖放照片萃取 base color/height/normal/AO/roughness |
| **[Material Maker](https://www.materialmaker.org/)** | Win/Mac/Linux | 開源程序化材質工具（類似 Substance Designer），基於 Godot 引擎開發 |
| **[AwesomeBump](https://github.com/kmkolasinski/AwesomeBump)** | Win/Mac/Linux | 開源替代方案 |

### AI 驅動（Freemium）

| 工具 | 說明 |
|------|------|
| **[InstaMAT](https://instamaterial.com/)** | "Materialize Image" 功能，單張照片生成全部 PBR 貼圖，含陰影消除。有免費方案 |
| **[D5 Render AI PBR Material Snap](https://www.d5render.com/posts/free-pbr-textures-ai-pbr-material-snap-d5)** | 一鍵照片轉 PBR，AI 無縫平鋪，升頻至 4K |

### 建議工作流程

1. 拍攝光線均勻的表面照片
2. 用 **GenPBR**（快速免費私密）或 **Materialize**（更多控制）處理
3. 在 Blender shader editor 微調法線貼圖強度和粗糙度
4. 作為 glTF 材質的一部分匯出

---

## 3. Godot 4 電氣模擬遊戲案例

### 直接相關專案

1. **[Analog Circuit Simulator](https://gdscript.com/devlogs/analog-circuit-simulator/)** — 用 Godot 建構，可繪製電路、施加激勵、探針量測電壓/電流/波形。最接近 Rewire 概念的 Godot 專案。

2. **[2D Energy/Power/Electricity Implementation](https://godotforums.org/d/18156-2d-energy-power-electricity-implementation-techniques)** — 討論 Rimworld/Factorio 風格的電力網格實作：電源、線路分配、斷線處理。涵蓋圖結構（graph-based）的電力流方法。

3. **[Electric Current in Godot](https://forum.godotengine.org/t/how-to-make-electric-current-in-godot/24830)** — 討論連接電源後精靈變色，模擬電路連通性。

### 相關資源

4. **[GDQuest Factorio-Inspired Simulation Demo](https://www.gdquest.com/tools/page/2/)** — 開源 Godot demo，網格式資源分配，適合電力/線路系統參考。

5. **[Science & Engineering Simulations with Godot (PDF)](https://waringworld.com/simbook/first%20part%20of%20Godot%20simulation%20book.pdf)** — Godot 科學模擬書籍，適合理解模擬迴圈模式。

### Godot 電氣模擬常見實作模式

基於社群討論，常見做法：
- 將電路建模為 **圖結構**（nodes = 接點，edges = 導線）
- 從電源用 **BFS/DFS** 判斷哪些節點帶電
- 用 Kirchhoff 定律或簡化模型計算電流/電壓
- 透過 shader 參數（發光、變色）提供視覺回饋

### 與 Rewire 現有架構的對應

| Rewire 現有模組 | Godot 3D 對應 |
|-----------------|---------------|
| `simulation.ts`（step/stepMulti） | GDScript 純函式模擬引擎，可幾乎 1:1 移植 |
| `scoring.ts` | 直接移植，與渲染無關 |
| `routing.ts`（Dijkstra） | 直接移植，改為 3D 空間路徑 |
| CircuitDiagram SVG | 3D 場景中的配電盤模型 + 線材模型 |
| FloorPlanView SVG | 3D 房屋場景（第一人稱/俯視） |
| 拖曳接線（Pointer Events） | Godot RayCast3D + InputEventMouseButton |

---

## 4. Blender 配電盤 / NFB 斷路器建模

### 現成模型資源

| 來源 | 說明 | 格式 |
|------|------|------|
| **[BlenderKit - Circuit Breaker](https://www.blenderkit.com/asset-gallery-detail/d91d546c-1556-4aa9-b241-4a87ed6d6fff/)** | 高精細斷路器，精確比例，乾淨拓撲 | .blend |
| **[Superhive - Electrical Panel](https://superhivemarket.com/products/electrical-panel)** | 9 個獨立物件（外殼/蓋板/扳桿/測試按鈕），2 組 UV，PBR 材質。扳桿獨立可動畫 | .blend (3.3+) |
| **[iMeshh - Circuit Breaker 01](https://shop.imeshh.com/product/electrical-circuit-breaker-3d-model/)** | 建築視覺化品質的斷路器模型 | .blend |
| **[Free3D](https://free3d.com/premium-3d-models/breaker)** | 231 個斷路器模型 | 多格式 |
| **[TurboSquid](https://www.turbosquid.com/3d-model/electrical-panel)** | 300+ 配電盤模型 | 多格式 |

### 自行建模工作流程

NFB 斷路器是硬表面方盒物件（帶開關和 DIN rail 夾扣），建模步驟：

1. **Box modeling**：從 Cube 開始，細分主體形狀（典型 NFB：~18mm 寬 × 70mm 高 × 65mm 深 / 極）
2. **Boolean 切割**：加入扳桿凹槽、標籤凹陷、接線端子開口
3. **Bevel 倒角**：Bevel modifier（2-3 段, 0.5mm 寬）製造真實邊緣反光
4. **扳桿**：獨立建模，pivot 設在鉸鏈處（方便動畫翻轉 ON/OFF）
5. **DIN rail 夾扣**：獨立 mesh，可重複使用
6. **UV + PBR 材質**：Box projection 適用於主體；印刷標籤用 decal 方式
7. **配電箱體**：鈑金盒 + 挖孔（knockout），flat face 延伸邊緣做翻唇

### 台灣 NFB 參考尺寸

| 規格 | 額定電流 | 寬度（每極） | 高度 | 深度 |
|------|---------|-------------|------|------|
| 小型 NFB | 15A/20A | 18mm | 70mm | 65mm |
| 大型 NFB | 30A | 36mm (2P) | 80mm | 70mm |

---

## 5. Godot 4 大型專案結構

### 推薦資料夾配置

```
res://
├── project.godot
├── addons/                    # 第三方插件
├── assets/                    # 依遊戲功能分類（非依資產類型）
│   ├── electrical_panel/      # 配電盤相關
│   │   ├── panel.tscn
│   │   ├── panel.gd
│   │   ├── panel.glb
│   │   └── panel_albedo.png
│   ├── wires/                 # 線材
│   ├── rooms/                 # 房間場景
│   │   ├── living_room/
│   │   ├── kitchen/
│   │   └── bathroom/
│   ├── appliances/            # 電器模型
│   │   ├── air_conditioner/
│   │   ├── water_heater/
│   │   └── ...
│   ├── nfb_breakers/          # NFB 斷路器
│   └── ui/                    # UI 元件
│       ├── hud/
│       ├── menus/
│       └── shared_ui_theme.tres
├── scenes/                    # 頂層遊戲場景
│   ├── main_menu.tscn
│   ├── level_select.tscn
│   └── gameplay.tscn
├── scripts/
│   ├── autoloads/             # Singleton
│   │   ├── game_manager.gd
│   │   ├── audio_manager.gd
│   │   └── simulation_engine.gd  # ← Rewire simulation.ts 移植
│   ├── resources/             # Custom Resource 類
│   │   ├── circuit_data.gd    # ← Rewire game.ts 型別
│   │   ├── wire_spec.gd       # ← Rewire constants.ts
│   │   ├── level_data.gd      # ← Rewire levels.ts
│   │   └── floor_plan.gd      # ← Rewire floorPlan.ts
│   └── utils/
│       ├── scoring.gd         # ← Rewire scoring.ts
│       └── routing.gd         # ← Rewire routing.ts
├── shaders/
│   ├── wire_heat.gdshader     # 線材過熱視覺效果
│   ├── electric_arc.gdshader  # 電弧效果
│   └── smoke_particle.gdshader
├── audio/
│   ├── sfx/
│   └── music/
└── data/
    ├── levels/                # Level JSON/tres 定義
    └── floor_plans/           # FloorPlan 資料
```

### 關鍵設計原則

1. **依功能分類，非依資產類型** — 場景的腳本、材質、模型放在同一資料夾
2. **場景是第一公民** — 每個 .tscn 有專屬資料夾
3. **共用資源上移** — 多功能共用的 shader 放 `shaders/`
4. **避免過度嵌套** — 3-4 層深度最佳
5. **Autoload 精簡使用** — 僅真正跨場景的關注點（存檔、音效、事件匯流排）
6. **偏好 .tres 而非 .res** — 人類可讀，版控友善
7. **Git LFS** — .png/.glb/.wav/.ogg 等二進位資產用 LFS 管理

### 架構模式

- 用 **信號（signals）** 解耦（Godot 內建觀察者模式）
- 用 **狀態機** 管理複雜實體行為
- **組合模式** 優於深層繼承（掛載行為 node 而非繼承 base class）
- 用 **Custom Resources (.tres)** 做資料驅動設計（關卡、線材規格、迴路配置）

---

## 6. Rewire 轉換策略建議

### 階段式轉換路線圖

#### Phase 1：核心引擎移植（純邏輯，無 3D）

直接將以下 TypeScript 模組移植為 GDScript：
- `simulation.ts` → `simulation_engine.gd`（step/stepMulti/calcTotalCurrent）
- `scoring.ts` → `scoring.gd`（calcStars）
- `routing.ts` → `routing.gd`（Dijkstra + 星形/串聯）
- `game.ts` 型別 → Custom Resource classes
- `constants.ts` → `wire_spec.gd` + `appliance_data.gd`

**重點**：這些都是純函式，與渲染無關，可直接單元測試驗證正確性。

#### Phase 2：3D 資產製作

1. **配電盤**：使用現成模型（Superhive/BlenderKit）或自行 box modeling
2. **NFB 斷路器**：15A/20A/30A 三規格，扳桿可動畫
3. **線材**：Godot Path3D + CSGPolygon 或程序化 mesh
4. **房間場景**：基於現有 FloorPlan 資料（S/M/L/XL）建構 3D 場景
5. **電器**：簡化 low-poly 模型（冷氣、熱水器、烤箱等 13 種）
6. **PBR 材質**：拍攝實物照片 → GenPBR/Materialize 生成

#### Phase 3：互動系統

| 現有 Web 機制 | 3D 對應 |
|--------------|---------|
| SVG 拖曳接線 | RayCast3D 點擊 + 線材 snap to 端子 |
| Pointer Events | InputEventMouseButton/Motion + RayCast3D |
| FloorPlan 房間點擊 | 3D 房間碰撞體 + Area3D 偵測 |
| NFB 開關切換 | AnimationPlayer 扳桿翻轉 + 音效 |
| 壓接端子小遊戲 | 3D mini-game（壓接鉗模型 + timing bar） |
| 走線路由選擇 | 3D 空間中的路徑預覽 + 確認 |

#### Phase 4：視覺效果

| 效果 | 實作方式 |
|------|---------|
| 線材過熱 | Shader：color lerp（正常色 → 橘 → 紅）+ emission 增加 |
| 燒毀 | 粒子系統（GPUParticles3D）+ 斷裂動畫 |
| 電弧 | Line3D + 電弧 shader + 閃光 |
| 煙霧 | GPUParticles3D 煙霧粒子 |
| 電流流動 | Shader：animated UV offset on wire mesh |
| 房間照明 | OmniLight3D 依供電狀態切換（亮/閃爍/暗） |

### 工作量評估

| 階段 | 主要工作 | 複雜度 |
|------|---------|--------|
| Phase 1 | TS → GDScript 移植 | 中（邏輯相同，語法轉換） |
| Phase 2 | 3D 模型製作 | 高（13 種電器 + 配電盤 + 4 種房型） |
| Phase 3 | 互動重建 | 高（拖曳系統完全重寫） |
| Phase 4 | 視覺效果 | 中（Godot shader/particle 功能完善） |

### 替代方案：Web 3D（Three.js / React Three Fiber）

如果希望保留 Web 部署優勢，可考慮：
- **React Three Fiber**：保留現有 React 架構 + hooks，加入 3D 渲染
- 優點：現有邏輯零移植成本、PWA/Web 部署不變
- 缺點：3D 效能不如原生、觸控互動較複雜

### 建議

考慮到 Rewire 現有架構（純函式引擎 + React UI），**Phase 1 的引擎移植風險最低**，建議優先執行並驗證。3D 資產製作（Phase 2）可平行進行。互動系統（Phase 3）是最大挑戰，需要完全重新設計拖曳/接線的 UX。
