# Unblock Me Solver —— 滑块拼图求解器

一个基于 Web 的滑块拼图（[塞车时间](<https://zh.wikipedia.org/zh-cn/%E5%A1%9E%E8%BB%8A%E6%99%82%E9%96%93_(%E9%81%8A%E6%88%B2)>)）最佳解求解器，使用广度优先搜索（BFS）算法计算最少移动步数的最优解法。

## 功能特性

- **最佳解求解器**：使用广度优先搜索（BFS）算法，保证找出最少移动步数的最优解
- **内置预设谜题**：提供初级（Beginner）、中级（Intermediate）、进阶（Advanced）三种难度的预设关卡，无需手动设定即可快速体验
- **自定义拼图编辑器**：支持自由放置水平方块与垂直方块（大小 2 或 3），可标记目标方块（红色），打造专属关卡
- **动画解法播放器**：逐步可视化展示求解过程，支持播放／暂停、速度调整（0.5x ～ 4x）、键盘快捷键（`←` `→` 逐步移动、`Space` 播放／暂停）；进度条显示当前步骤，并标注每一步移动的方块编号、方向与距离
- **完成特效**：成功求解时显示缤纷彩带（confetti）动画庆祝效果
- **深色模式**：自动跟随系统 `prefers-color-scheme` 设定，支持浅色与深色主题
- **响应式设计**：适配桌面与移动端设备，在不同屏幕尺寸下均有良好体验

## 技术栈

| 技术                                         | 版本   | 用途     |
| -------------------------------------------- | ------ | -------- |
| [Next.js](https://nextjs.org)                | 16.2.7 | 应用框架 |
| [React](https://react.dev)                   | 19.2.4 | UI 框架  |
| [Tailwind CSS](https://tailwindcss.com)      | 4      | 样式设计 |
| [TypeScript](https://www.typescriptlang.org) | 5      | 类型安全 |

## 快速开始

### 环境需求

- Node.js 18 或以上版本

### 安装与运行

```bash
# 克隆项目
git clone https://github.com/kingsley1116/unblock-me-solver.git
cd unblock-me-solver

# 安装依赖
npm install

# 启动开发服务器
npm run dev

```

打开浏览器并访问 [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) 即可使用。

### 构建生产版本

```bash
npm run build
npm start

```

## 工作原理

### 广度优先搜索（BFS）

求解器使用广度优先搜索（Breadth-First Search）算法，从初始盘面状态出发，逐层探索所有可能的移动，保证找到的解法为最少移动步数。

#### 核心流程

1. **状态编码**：将棋盘上所有方块的位置编码为唯一字符串（格式如 `1:2,1|2:0,0|...`），用作状态哈希值（state hash）
2. **已访问集合**：使用 `Set<string>` 记录已访问的状态，避免重复搜索同一盘面，防止死循环
3. **移动生成**：对于每个棋盘状态，遍历所有方块，检查其可移动的方向与距离，生成所有合法移动
4. **广度优先遍历**：使用队列（queue）进行 BFS，首次到达目标状态（红色方块右侧边缘位于第 6 列）即为最优解
5. **路径重建**：通过父状态对照表（parent map）反向追踪，从目标状态回溯至初始状态，重建完整的移动序列

#### 棋盘规则

- 棋盘大小：6 × 6 网格
- 方块类型：水平（horizontal，大小 2 或 3）和垂直（vertical，大小 2 或 3）
- 目标方块：一个红色水平方块，必须从棋盘右侧出口移出（方块的右侧边缘到达第 6 列即为胜利）
- 方块只能沿其自身方向滑动，不能旋转或跨越其他方块

## 项目结构

```
src/
├── app/
│   ├── globals.css          # 全局样式（Tailwind + 自定义动画）
│   ├── layout.tsx           # 根布局
│   └── page.tsx             # 主页面入口
├── components/
│   ├── board.tsx            # 棋盘渲染组件
│   ├── color-utils.ts       # 方块颜色工具
│   ├── puzzle-editor.tsx    # 自定义拼图编辑器
│   ├── puzzle-selector.tsx  # 预设拼图选择器
│   ├── solution-player.tsx  # 解法动画播放器
│   ├── solver-test.tsx      # 求解器测试组件
│   └── unblock-me-app.tsx   # 主应用组件
└── lib/
    ├── presets.ts           # 预设拼图数据
    ├── solver.ts            # BFS 求解器核心逻辑
    └── types.ts             # TypeScript 类型定义

```

## 授权

MIT.
