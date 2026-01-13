# Life Tracker - Claude Code 專案配置

## 專案概述

生活作息記錄網頁應用，用於記錄飲食、睡眠、運動等日常生活數據，支援統計分析和視覺化呈現。

## 技術棧

- **前端框架**: React 18 + TypeScript
- **構建工具**: Vite
- **樣式**: Tailwind CSS
- **狀態管理**: Zustand
- **表單**: React Hook Form + Zod
- **圖表**: Recharts
- **後端**: Supabase (Auth, Database, Storage)
- **路由**: React Router v6

## 目錄結構

```
src/
├── components/       # React 組件
│   ├── common/       # 通用組件 (Button, Input, Card, Modal)
│   ├── layout/       # 佈局組件 (Header, Sidebar, AppLayout)
│   ├── records/      # 記錄相關組件
│   │   ├── forms/    # 各類型記錄表單
│   │   └── widgets/  # 表單小工具
│   ├── calendar/     # 日曆組件
│   └── stats/        # 統計圖表組件
├── pages/            # 頁面組件
├── hooks/            # 自訂 React Hooks
├── stores/           # Zustand 狀態管理
├── lib/              # 工具函數和類型
│   ├── supabase.ts   # Supabase 客戶端
│   ├── types.ts      # TypeScript 類型定義
│   ├── constants.ts  # 常量配置
│   └── utils.ts      # 通用工具函數
└── styles/           # 全局樣式
```

## 開發命令

```bash
# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build

# 代碼檢查
npm run lint

# 類型檢查
npx tsc --noEmit
```

## 編碼規範

- 使用 TypeScript 嚴格模式
- 組件使用函數式組件 + Hooks
- 使用 Tailwind CSS 進行樣式設計
- 表單驗證使用 Zod schema
- 優先使用 named exports
- 檔案命名使用 PascalCase (組件) 或 camelCase (工具函數)

## 記錄類型

系統支援 8 種記錄類型：
1. `meal` - 飲食記錄
2. `bowel` - 排便記錄
3. `sleep` - 睡眠記錄
4. `exercise` - 運動記錄
5. `medication` - 藥物記錄
6. `water` - 飲水記錄
7. `mood` - 心情記錄
8. `intimacy` - 親密記錄

## Supabase 資料表

- `users` - 用戶資料
- `records` - 記錄數據 (使用 JSONB 存儲不同類型的數據)
- `custom_record_types` - 自訂記錄類型
- `streaks` - 連續記錄統計

## 注意事項

- 所有 API 呼叫通過 Supabase 客戶端
- 使用 RLS (Row Level Security) 保護數據
- 敏感記錄（如親密記錄）預設為私密
- 環境變數存放在 `.env` 檔案（不提交至 Git）
