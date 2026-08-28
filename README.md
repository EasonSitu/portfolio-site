# 司徒智成 Portfolio — 招聘導向三語個人網站

這是一個以「招聘者掃描路徑」為核心設計的三語（English / 簡體 / 繁體）靜態作品集網站。我不是套用模板，而是由自己主導從定位、資訊架構、三語內容、互動設計到前端實作與發布的完整交付，並以 AI-accelerated iterations 加速設計與開發循環。

- 主站（Vultr）：https://eason.sanhehangjm.cn/
- GitHub Pages：https://easonsitu.github.io/portfolio-site/
- 歷史版本索引：https://eason.sanhehangjm.cn/versions/

## 這個專案展示的能力

網站本身對應我的職涯定位：**Digital & AI Solution Delivery · Project Coordination**。這個 repo 記錄的不只是前端成品，而是一個由一人主導、可追溯、可發布的完整小型交付專案：

- **策劃**：先定義受眾（招聘者 10–60 秒的掃描行為），再反推資訊架構——Hero 定位 → 量化指標 → 經歷時間線 → 精選項目 → 能力與 AI 實踐 → 聯絡方式。
- **內容管理**：三語內容集中於單一資料檔（`data/content.mjs`），量化事實口徑一致（30+ 參與項目 / 20+ 主導項目 / 10+ 軟硬體整合 / 8 次原型迭代）。
- **執行與工程**：Next.js 靜態導出、雙部署管線、合約測試、無障礙檢查與視口回歸矩陣（見下文）。
- **過程可追溯**：`docs/` 內保留 plans、specs 與階段交接文件；重大改動先寫計劃再動工。
- **代碼治理**：曾主動清理模板遺留的 45 個零引用元件、15 個死依賴與 Tailwind 殘留配置，讓活躍代碼面積與真實功能一致。

## 網站功能

- 三語即時切換（EN / 简体 / 繁體），`<html lang>` 與內容同步更新，並在 hydration 前預先套用儲存的語言以減少首屏閃動
- Hero 五層「數碼交付工作模型」3D 互動（GLB + OrbitControls），含靜態 PNG 回退、WebGL 失效回退與 `prefers-reduced-motion` 支援
- Experience 可折疊經歷時間線：預設展開最新經歷，切換公司時自動將該條目對齊視口頂部，折疊內容以 `inert` 移出鍵盤焦點
- Recent Work 橫向拖拽軌道：支援滑鼠拖動、鍵盤方向鍵與按鈕滾動，拖動後抑制誤觸點擊
- 對招聘者友好的無障礙細節：axe 檢查通過、鍵盤可完整操作、色彩對比達標
- 純靜態輸出：無後端依賴，CV PDF 直接下載，聯絡連結指向真實目的地

## 交付與品質流程

- **合約測試**：99 項 node:test 合約測試鎖定版面結構、三語內容、互動行為、Hero 3D 合同與發布 metadata（`pnpm test`）
- **回歸矩陣**：發布前檢查 6 個視口（1440/1280/1024/768/390/375）× 3 語言，確認無橫向溢出、無 console 錯誤、CTA 完整
- **無障礙與效能審計**：以 axe-core、Lighthouse、Playwright 組成 QA 工具鏈（已納入 devDependencies），審計結果留存於本地 `audit/`（不入庫）
- **發布驗證**：GitHub Pages 子路徑構建後檢查資源前綴與 OG metadata（絕對 `og:image`、`og:url`、`og:locale`）

## 部署與版本歷史

同一份代碼通過環境變數構建出三個目標：

| 目標 | 路徑 | 說明 |
|---|---|---|
| GitHub Pages | `/portfolio-site/` | `DEPLOY_TARGET=github-pages` + basePath |
| Vultr 主站 | `/` | push 到 `main` 自動構建並切換 `current` |
| 版本預覽 | `/versions/<commit-sha>/` | 每次發布的不可變快照 |

版本歷史功能：

- 每次 `main` push 都會同時構建正式版與版本預覽，上傳至 `releases/<sha>` 與 `versions/<sha>`
- `/versions/` 提供自動生成的索引頁，列出所有已部署版本與時間，可直接瀏覽任一歷史快照
- 每個版本目錄自帶 CSS / JS / PDF / GLB，資源路徑完整、互不干擾，便於回溯任一時點的網站狀態

## 技術棧

- Next.js 14（Pages Router、`output: "export"` 靜態導出、`trailingSlash`）
- React 18 + Three.js / @react-three/fiber（Hero 3D）
- Sass CSS Modules + 集中式 design tokens（間距、字級、動效、hairline 系統）
- pnpm 單一鎖文件；GitHub Actions 雙管線（Pages + Vultr SSH 部署）

## 本機開發

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # node --test tests/*.test.mjs
pnpm lint
pnpm build    # 本地/根路徑目標
```

構建 GitHub Pages 目標：

```bash
DEPLOY_TARGET=github-pages \
NEXT_PUBLIC_BASE_PATH=/portfolio-site \
NEXT_PUBLIC_SITE_URL=https://easonsitu.github.io/portfolio-site \
pnpm build
```

## Credits

版面起點改編自 [Devfolio by Shubh Porwal](https://github.com/shubh73/devfolio)（MIT License）。其後的資訊架構、內容、互動設計、3D 場景整合、雙部署管線與品質流程均為本人重新設計與實作，原版權與授權聲明保留於 `LICENSE.md`。
