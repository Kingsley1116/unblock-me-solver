# Unblock Me Solver —— 滑塊拼圖求解器

一個基於 Web 的滑塊拼圖（[Rush Hour](<https://zh.wikipedia.org/wiki/%E5%A1%9E%E8%BB%8A%E6%99%82%E9%96%93_(%E9%81%8A%E6%88%B2)>)）最佳解求解器，使用廣度優先搜尋（BFS）演算法計算最少移動步數的最優解法。

## 功能特性

- **最佳解求解器**：使用廣度優先搜尋（BFS）演算法，保證找出最少移動步數的最優解
- **內置預設謎題**：提供初級（Beginner）、中級（Intermediate）、進階（Advanced）三種難度的預設關卡，無需手動設定即可快速體驗
- **自訂拼圖編輯器**：支援自由放置水平方塊與垂直方塊（大小 2 或 3），可標記目標方塊（紅色），打造專屬關卡
- **動畫解法播放器**：逐步視覺化展示求解過程，支援播放／暫停、速度調整（0.5x ～ 4x）、鍵盤快捷鍵（`←` `→` 逐步移動、`Space` 播放／暫停）；進度條顯示當前步驟，並標註每一步移動的方塊編號、方向與距離
- **完成特效**：成功求解時顯示繽紛彩帶（confetti）動畫慶祝效果
- **深色模式**：自動跟隨系統 `prefers-color-scheme` 設定，支援淺色與深色主題
- **響應式設計**：適配桌面與行動裝置，在不同螢幕尺寸下均有良好體驗

## 技術棧

| 技術                                         | 版本   | 用途     |
| -------------------------------------------- | ------ | -------- |
| [Next.js](https://nextjs.org)                | 16.2.7 | 應用框架 |
| [React](https://react.dev)                   | 19.2.4 | UI 框架  |
| [Tailwind CSS](https://tailwindcss.com)      | 4      | 樣式設計 |
| [TypeScript](https://www.typescriptlang.org) | 5      | 型別安全 |

## 快速開始

### 環境需求

- Node.js 18 或以上版本

### 安裝與執行

```bash
# 複製專案
git clone https://github.com/kingsley1116/unblock-me-solver.git
cd unblock-me-solver

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

開啟瀏覽器並訪問 [http://localhost:3000](http://localhost:3000) 即可使用。

### 建構生產版本

```bash
npm run build
npm start
```

## 工作原理

### 廣度優先搜尋（BFS）

求解器使用廣度優先搜尋（Breadth-First Search）演算法，從初始盤面狀態出發，逐層探索所有可能的移動，保證找到的解法為最少移動步數。

#### 核心流程

1. **狀態編碼**：將棋盤上所有方塊的位置編碼為唯一字串（格式如 `1:2,1|2:0,0|...`），用作狀態雜湊值（state hash）
2. **已造訪集合**：使用 `Set<string>` 記錄已造訪的狀態，避免重複搜尋同一盤面，防止無窮迴圈
3. **移動生成**：對於每個棋盤狀態，遍歷所有方塊，檢查其可移動的方向與距離，生成所有合法移動
4. **廣度優先遍歷**：使用佇列（queue）進行 BFS，首次到達目標狀態（紅色方塊右側邊緣位於第 6 列）即為最優解
5. **路徑重建**：透過父狀態對照表（parent map）反向追蹤，從目標狀態回溯至初始狀態，重建完整的移動序列

#### 棋盤規則

- 棋盤大小：6 × 6 網格
- 方塊類型：水平（horizontal，大小 2 或 3）和垂直（vertical，大小 2 或 3）
- 目標方塊：一個紅色水平方塊，必須從棋盤右側出口移出（方塊的右側邊緣到達第 6 列即為勝利）
- 方塊只能沿其自身方向滑動，不能旋轉或跨越其他方塊

## 專案結構

```
src/
├── app/
│   ├── globals.css          # 全域樣式（Tailwind + 自訂動畫）
│   ├── layout.tsx           # 根佈局
│   └── page.tsx             # 主頁面入口
├── components/
│   ├── board.tsx            # 棋盤渲染元件
│   ├── color-utils.ts       # 方塊顏色工具
│   ├── puzzle-editor.tsx    # 自訂拼圖編輯器
│   ├── puzzle-selector.tsx  # 預設拼圖選擇器
│   ├── solution-player.tsx  # 解法動畫播放器
│   ├── solver-test.tsx      # 求解器測試元件
│   └── unblock-me-app.tsx   # 主應用元件
└── lib/
    ├── presets.ts           # 預設拼圖資料
    ├── solver.ts            # BFS 求解器核心邏輯
    └── types.ts             # TypeScript 型別定義
```

## 授權

MIT.
