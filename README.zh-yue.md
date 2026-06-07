# Unblock Me Solver —— 網頁版滑塊拼圖（ Rush Hour ）最佳解求解器

呢個係一個基於 Web 嘅滑塊拼圖（Rush Hour）最佳解求解器，使用廣度優先搜尋（BFS）演算法，幫你計算出用最少步數行完嘅最優解法。

## 功能特性

- **最強神算（最佳解求解器）**：採用廣度優先搜尋（BFS）演算法，保證幫你搵出用最少移動步數嘅最完美行法。
- **內置預設副本（謎題）**：提供初級（Beginner）、中級（Intermediate）、進階（Advanced）三種難度嘅預設關卡，一開即玩，唔使自己慢慢排。
- **自訂拼圖編輯器**：你可以自由放置打橫或者打豎嘅方塊（大細 2 或 3），仲可以標記目標方塊（紅色），自創屬於你嘅專屬地獄關卡。
- **動畫解法播放器**：一步一步視覺化展示成個破解過程，支援播放／暫停、速度微調（0.5x ～ 4x）、鍵盤快捷鍵（`←` `→` 逐步睇、`Space` 播放／暫停）；進度條會顯示行到第幾步，仲會寫清楚每一步搬動邊個方塊、行咩方向同埋行咗幾多格。
- **成功特效**：成功破關嗰陣會噴出繽紛彩帶（confetti）動畫，同你一齊慶祝。
- **深色模式**：自動跟隨系統嘅 `prefers-color-scheme` 設定，完美支援淺色同埋深色主題。
- **響應式設計**：通殺電腦同電話（流動裝置），喺唔同螢幕大細之下都有極佳嘅操作體驗。

## 技術棧

| 技術                                         | 版本   | 用途                  |
| -------------------------------------------- | ------ | --------------------- |
| [Next.js](https://nextjs.org)                | 16.2.7 | 應用程式框架          |
| [React](https://react.dev)                   | 19.2.4 | UI 框架               |
| [Tailwind CSS](https://tailwindcss.com)      | 4      | Style 樣式設計        |
| [TypeScript](https://www.typescriptlang.org) | 5      | Type 安全（型別安全） |

## 快速開始

### 環境需求

- Node.js 18 或以上版本

### 安裝與實行（Run）

```bash
# 複製 Project
git clone https://github.com/kingsley1116/unblock-me-solver.git
cd unblock-me-solver

# 安裝 Dependency
npm install

# 著 Dev Server
npm run dev

```

跟手打開瀏覽器，入去 `http://localhost:3000` 就玩得。

### Build 生產版本

```bash
npm run build
npm start

```

## 工作原理

### 廣度優先搜尋（BFS）

求解器採用廣度優先搜尋（Breadth-First Search）演算法。由一開始嘅棋盤狀態出發，一整層一整層咁向外探索所有可能嘅郁動，確保第一個搵到嘅答案一定係用最少移動步數嘅最優解。

#### 核心流程

1. **狀態編碼**：將棋盤上面所有方塊嘅位置，編碼做一串獨一無二嘅 String（格式好似 `1:2,1|2:0,0|...`），用嚟做狀態嘅 Hash 值（state hash）。
2. **已造訪集合**：用 `Set<string>` 記低所有行過嘅狀態，費事重複搜尋同一個盤面，亦可以防止程式陷入無窮迴圈（死 Loop）。
3. **郁動生成**：針對每一個棋盤狀態，遂個方塊巡查，睇吓佢有咩方向同埋有幾多格可以行，從而產生晒所有合法嘅行法。
4. **廣度優先遍歷**：用 Queue（佇列）去跑 BFS。當第一次去到目標狀態（紅色方塊嘅右邊邊緣去到第 6 列）嗰陣，就確認呢個係最完美嘅解法。
5. **路徑重建**：透過父狀態對照表（parent map）反向追蹤，由終點狀態一路去返起點，重構返成條完整嘅移動步驟。

#### 棋盤規則

- 棋盤大細：6 × 6 網格。
- 方塊類型：打橫（horizontal，大細 2 或 3）同埋打豎（vertical，大細 2 或 3）。
- 目標方塊：一嚿紅色嘅打橫方塊，一定要由棋盤右邊嘅出口移出（當方塊嘅右邊邊緣去到第 6 列就當贏）。
- 方塊淨係可以順住自己打橫或打豎嘅方向滑動，唔可以旋轉，亦唔可以跨越或者疊喺其他方塊上面。

## 專案結構

```
src/
├── app/
│   ├── globals.css          # 全域樣式（Tailwind + 自訂動畫）
│   ├── layout.tsx           # Root 佈局
│   └── page.tsx             # 主頁面入口
├── components/
│   ├── board.tsx            # 棋盤 Render 元件
│   ├── color-utils.ts       # 方塊顏色工具
│   ├── puzzle-editor.tsx    # 自訂拼圖編輯器
│   ├── puzzle-selector.tsx  # 預設拼圖選擇器
│   ├── solution-player.tsx  # 解法動畫播放器
│   ├── solver-test.tsx      # 求解器測試元件
│   └── unblock-me-app.tsx   # 主應用程式元件
└── lib/
    ├── presets.ts           # 預設拼圖資料
    ├── solver.ts            # BFS 求解器核心 Logic
    └── types.ts             # TypeScript Type 定義

```

## 授權協定

MIT.
