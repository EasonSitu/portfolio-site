# 司徒智成 · Portfolio

三語（English／简体／繁體）靜態作品集，包括了定位、資訊架構、三語內容、互動設計，目前完成了前端實作和部署，開發過程用 AI-accelerated iterations 加速迭代。

- 主站：https://eason.sanhehangjm.cn/
- GitHub Pages：https://easonsitu.github.io/portfolio-site/
- 歷史版本索引：https://eason.sanhehangjm.cn/versions/

## 為什麼長這樣

招聘者在一個網站上大概只停留幾十秒，所以整個資訊架構是按掃描順序排的：Hero 先講定位，接著量化指標（30+ 參與項目、20+ 主導、10+ 軟硬體整合），然後是經歷時間線、精選項目，最後才是聯絡方式。三語內容集中在 `data/content.mjs` 一個檔案裡，改文案不用碰組件。

## 主要功能

- 三語即時切換，`<html lang>` 同步更新；載入時先套用 localStorage 記住的語言，減少首屏閃動
- Hero 是五層「數碼交付流程」3D 模型（GLB + OrbitControls）。WebGL 不可用或載入失敗時退回靜態圖，也支援 `prefers-reduced-motion`
- 經歷時間線可折疊，預設展開最近一段經歷；切換公司時自動把該條目捲到視窗頂部對齊，折疊中的內容用 `inert` 擋住鍵盤焦點
- Recent Work 支援拖拽、方向鍵和按鈕三種操作，拖完不會誤點進案例頁
- 全靜態輸出，沒有後端，CV PDF 直接下載

## 品質

`pnpm test` 有 99 個合約測試，覆蓋版面結構、三語內容、互動行為和發布 metadata。發布前跑 6 個視口（1440/1280/1024/768/390/375）× 3 語言的回歸檢查，無障礙和效能用 axe-core、Lighthouse、Playwright 審計，問題會在合併前修掉。

中間還清過一次債：模板留下 45 個零引用組件和 15 個沒用到的依賴，全部刪掉之後，活躍代碼就是網站實際在跑的部分，讀起來輕鬆很多。

## 部署與版本

push 到 `main` 會觸發兩條 workflow。GitHub Pages 走子路徑構建；Vultr 那條會同時構建正式版和一份版本快照：

| 目標 | 路徑 |
|---|---|
| GitHub Pages | `/portfolio-site/` |
| Vultr 主站 | `/` |
| 版本快照 | `/versions/<commit-sha>/` |

`/versions/` 是自動生成的索引頁，列出每次發布的時間和連結，點進去就是當時的網站。每個版本目錄自帶 CSS、JS、PDF、GLB，互相獨立，對照兩個版本就能看出每次改了什麼。

## 技術棧

Next.js 14 靜態導出（Pages Router，`output: "export"`）、React 18、Three.js + @react-three/fiber、Sass CSS Modules，樣式值集中在一組 design tokens 裡。套件用 pnpm 管理。

## 本機跑起來

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test
pnpm lint
pnpm build
```

構建 GitHub Pages 目標時帶上環境變數：

```bash
DEPLOY_TARGET=github-pages \
NEXT_PUBLIC_BASE_PATH=/portfolio-site \
NEXT_PUBLIC_SITE_URL=https://easonsitu.github.io/portfolio-site \
pnpm build
```

## Credits

起點是 [Devfolio by Shubh Porwal](https://github.com/shubh73/devfolio)（MIT License）。之後的資訊架構、內容、互動、3D 整合和部署管線都重做過，原授權聲明保留在 `LICENSE.md`。
