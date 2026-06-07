# Unblock Me Solver — 滑块拼图求解器

一个基于 Web 的 [Unblock Me](https://en.wikipedia.org/wiki/Rush_Hour_%28puzzle%29)（华容道/滑块拼图）最优解求解器，使用广度优先搜索（BFS）算法计算最短步数解，并在浏览器中以动画形式播放完整求解过程。

## 功能特性

- **最优解求解器**：基于 BFS 算法，结合状态哈希与已访问集合进行去重，保证找到步数最短的解法
- **内置预设关卡**：提供初级、中级、高级三个难度等级的预设拼图，开箱即用
- **自定义关卡编辑器**：支持在 6x6 棋盘上自由放置水平（大小 2-3）和垂直（大小 2-3）滑块，自主设计拼图
- **解法动画播放器**：将求解结果以动画形式逐步展示，支持播放/暂停、0.5x 至 4x 倍速调节，并提供键盘快捷键操作
- **完成特效**：目标滑块成功移出棋盘后触发彩屑庆祝效果
- **暗色模式**：通过 `prefers-color-scheme` 媒体查询自动适配系统主题
- **响应式设计**：适配桌面端与移动端不同屏幕尺寸

## 技术栈

| 技术 | 用途 |
|------|------|
| [Next.js](https://nextjs.org) 16.2.7 | 应用框架 |
| [React](https://react.dev) 19.2.4 | 用户界面 |
| [Tailwind CSS](https://tailwindcss.com) 4 | 样式方案 |
| [TypeScript](https://www.typescriptlang.org) 5 | 类型安全 |

## 快速开始

```bash
# 克隆仓库
git clone <repository-url>
cd unblock-me-solver

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可使用。

```bash
# 生产构建
npm run build

# 启动生产服务器
npm start
```

## 工作原理

本项目的求解器采用**广度优先搜索（BFS）**算法。由于 BFS 按层遍历状态空间，首次到达目标状态时找到的路径即为最短路径（最少移动步数）。

### 核心流程

1. **状态编码**：将棋盘上每个滑块的位置 `(row, col)` 按滑块 ID 排序后拼接为字符串，作为状态的唯一哈希值
2. **移动生成**：遍历每个滑块，在其移动方向上检测连续的空位，为每个可能的步数生成一个合法移动
3. **去重**：使用 `Set<string>` 记录已访问的状态哈希，避免重复搜索
4. **路径回溯**：BFS 过程中维护 `parentMap`，记录每个状态的前驱状态及移动操作；找到目标状态后，从目标状态逆向回溯至初始状态，得出完整解法序列

### 数据结构

- **棋盘**：6x6 二维数组 `number[][]`，每个单元格存储滑块 ID（0 表示空格）
- **滑块（Block）**：具有 `orientation`（`horizontal` / `vertical`）、`size`（2 或 3）、位置 `(row, col)` 以及 `isGoal` 标记
- **目标判定**：红色目标滑块为水平方向，其右边缘到达棋盘最右端（列索引为 `GRID_SIZE - 1`，即 5）时即为通关

## 项目结构

```
.
├── src/
│   ├── app/                      # Next.js App Router 页面
│   │   ├── layout.tsx            # 根布局
│   │   ├── page.tsx              # 首页
│   │   └── globals.css           # 全局样式（含 Tailwind 指令）
│   ├── components/               # React 组件
│   │   ├── unblock-me-app.tsx    # 主应用入口组件
│   │   ├── board.tsx             # 6x6 棋盘渲染
│   │   ├── puzzle-editor.tsx     # 自定义关卡编辑器
│   │   ├── puzzle-selector.tsx   # 预设关卡选择器
│   │   ├── solution-player.tsx   # 解法动画播放器
│   │   ├── solver-test.tsx       # 求解器测试面板
│   │   └── color-utils.ts        # 颜色工具函数
│   └── lib/                      # 核心逻辑库
│       ├── solver.ts             # BFS 求解器
│       ├── presets.ts            # 预设关卡数据
│       └── types.ts              # TypeScript 类型定义
├── public/                       # 静态资源
├── package.json                  # 项目配置与依赖
├── tsconfig.json                 # TypeScript 配置
├── next.config.ts                # Next.js 配置
├── postcss.config.mjs            # PostCSS 配置
└── eslint.config.mjs             # ESLint 配置
```

## 许可证

暂无。
