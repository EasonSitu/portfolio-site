# Archive Gate Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with verification checkpoints.

**Goal:** 将现有 Blender/Three.js Hero 与已确认的三语言文案整合成一套「档案之门」个人网站，改善背景与主体的色彩分离，并完成 About、Experience、Role、AI Practice、Contact 页面。

**Architecture:** 保留 `components/Hero` 与 `components/Hero3D` 作为实时 GLB Hero；新增一个页面壳组件负责导航、滚动章节和内容展示。所有文案继续由 `data/content.mjs` 提供，三语言切换只改变内容与少量语言类名，不复制页面结构。视觉统一由新的 Archive Gate CSS module 和全局 token 完成，旧组件不删除，方便回滚。

**Tech Stack:** Next.js 14 Pages Router, React 18, React Three Fiber, Three.js, GSAP（仅用于已有 Hero 入场）, SCSS modules, Node test runner。

## Global Constraints

- 保留 GLB `/models/hero-delivery-system.glb` 及当前五层交互，不改 Blender 文件。
- 背景使用午夜蓝黑，主体使用石墨灰，载板使用烟熏银蓝，能量使用香槟金，紫色只作为品牌和交互强调。
- 页面文案只使用已确认的 `data/content.mjs` 与中文文案审阅稿，不虚构履历、项目或成果。
- 支持 `en`、`zh-CN`、`zh-HK` 三种语言，并保留本地存储语言偏好。
- 尊重 `prefers-reduced-motion`；降低动态时仍能阅读全部内容。
- 不新增后端、数据库、登录或第三方表单服务。

## File Map

- Create: `components/ArchiveGate/ArchiveGateSite.js` — 页面壳、导航、滚动章节和内容渲染。
- Create: `components/ArchiveGate/ArchiveGateSite.module.scss` — 档案之门页面的颜色、排版、卡片和响应式样式。
- Modify: `pages/index.js` — 使用 `siteContent` 和 `ArchiveGateSite`，移除旧的 Hero-only 页面拼装。
- Modify: `data/content.mjs` — 为三种语言补充 skills、about、team value 和更完整的 section labels。
- Modify: `components/Hero/Hero.js` — 适配 `siteContent.hero` 数据形状，并让 workflow labels 使用档案标题。
- Modify: `components/Hero/Hero.module.scss` — 使用新背景层次、边缘渐隐和更清晰的左侧安全区。
- Modify: `components/Hero3D/HeroScene.js` — 更新运行时材质 token、光照对比和模型比例微调。
- Modify: `components/Hero3D/HeroScene.module.scss` — 将标签改为模型右侧的轻量档案索引，不遮挡面板。
- Modify: `styles/Home.module.scss` — 仅保留页面基础变量与导航兼容规则，避免旧 Hero-only 样式覆盖新页面。
- Modify: `styles/globals.scss` — 设定午夜蓝黑页面底色、选择色及基础排版。
- Modify: `tests/content.test.mjs` — 锁定三语言必备页面字段与 AI/Experience 数量。
- Modify: `tests/i18n.test.mjs` — 确认三语言可用且偏好可持续。

### Task 1: Lock the content contract with tests

**Files:**
- Modify: `tests/content.test.mjs`
- Modify: `data/content.mjs`

**Interfaces:**
- `siteContent[locale].about` exposes `primary`, `secondary`, and `keywords`.
- `siteContent[locale].teamValue` exposes four items with `title` and `description`.
- `siteContent[locale].skills` exposes three categories with non-empty item arrays.

- [ ] **Step 1: Add failing assertions**

```js
assert.ok(copy.about.primary);
assert.equal(copy.about.keywords.length, 5);
assert.equal(copy.teamValue.items.length, 4);
assert.equal(copy.skills.length, 3);
```

- [ ] **Step 2: Run the focused test and confirm the expected failure**

Run: `npm test -- tests/content.test.mjs`

Expected: FAIL because `about`, `teamValue`, and `skills` are not present in the current content object.

- [ ] **Step 3: Add the confirmed Chinese, Traditional Chinese and English content fields**

Use the approved copy structure: About keywords are product/software/project delivery/real-world delivery/actual use; team value is requirement quality/collaboration efficiency/delivery risk/communication loss; skills cover solution delivery, product/software, and AI practice.

- [ ] **Step 4: Run the focused test again**

Run: `npm test -- tests/content.test.mjs`

Expected: PASS with all existing chronology and verified metric assertions intact.

- [ ] **Step 5: Commit the content contract**

```bash
git add data/content.mjs tests/content.test.mjs
git commit -m "feat: define archive gate content contract"
```

### Task 2: Build the Archive Gate page shell

**Files:**
- Create: `components/ArchiveGate/ArchiveGateSite.js`
- Create: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Modify: `pages/index.js`

**Interfaces:**
- `ArchiveGateSite({ copy, locale, onLocaleChange })` renders navigation, `Hero`, About, evidence, Experience, Team Value, AI Practice, Contact and footer.
- All sections use stable IDs: `home`, `about`, `experience`, `role`, `ai`, `contact`.

- [ ] **Step 1: Add a render contract test helper**

Add a lightweight `lib/pageContract.mjs` with:

```js
export const ARCHIVE_GATE_SECTIONS = ["home", "about", "experience", "role", "ai", "contact"];
```

Extend `tests/content.test.mjs` to assert the list remains ordered and unique.

- [ ] **Step 2: Run tests and confirm the missing-helper failure**

Run: `npm test -- tests/content.test.mjs`

Expected: FAIL until `lib/pageContract.mjs` is created.

- [ ] **Step 3: Implement the page shell**

Use semantic `header`, `main`, `section`, `article`, and `footer`. Use `copy.nav` labels, `copy.about`, `copy.experienceHeader`, `copy.teamValue`, `copy.aiHeader`, and `copy.contact`. Add an IntersectionObserver hook to add a `data-visible` attribute to reveal blocks; if reduced motion is enabled, set them visible immediately.

- [ ] **Step 4: Replace the old index composition**

In `pages/index.js`, import `siteContent`, preserve `localStorage` locale handling, and render `<ArchiveGateSite copy={siteContent[locale]} ... />`.

- [ ] **Step 5: Run structural tests and build**

Run: `npm test`

Expected: PASS for content, workflow and i18n tests.

Run: `npm run build`

Expected: Next.js production build completes without errors.

- [ ] **Step 6: Commit the page shell**

```bash
git add components/ArchiveGate pages/index.js lib/pageContract.mjs tests/content.test.mjs
git commit -m "feat: connect archive gate portfolio sections"
```

### Task 3: Apply the color system and visual hierarchy

**Files:**
- Modify: `components/Hero/Hero.module.scss`
- Modify: `components/Hero3D/HeroScene.js`
- Modify: `components/Hero3D/HeroScene.module.scss`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Modify: `styles/globals.scss`

**Interfaces:**
- Hero continues to accept localized workflow layers and callbacks without changing GLB node names.
- Material token names remain `Web_Stone`, `Web_Graphite`, `Web_Crystal`, `Web_CrystalCore`, and `Web_EmissiveGold`.

- [ ] **Step 1: Add a visual smoke assertion**

Add a test that imports a small `lib/designTokens.mjs` object and asserts the five main colors are present and distinct.

- [ ] **Step 2: Run it and confirm it fails**

Run: `npm test -- tests/content.test.mjs`

Expected: FAIL because `lib/designTokens.mjs` does not exist.

- [ ] **Step 3: Add shared tokens and update runtime materials**

Set background to `#070B16`, stone to `#242733`, smoked glass to `#B9C0D4`, champagne energy to `#E7BE82`, and violet accent to `#8756E8`. Increase glass edge contrast and keep transmission controlled so the plates remain visible.

- [ ] **Step 4: Update page background and section surfaces**

Use deep indigo gradients in the page shell, graphite panels for content cards, and an understated warm transition at Contact. Remove the old near-black-only surface values that make the GLB disappear.

- [ ] **Step 5: Improve Hero label placement and edge masking**

Keep labels to the right of their projected panel anchors, but reduce their width, use archival index styling, and ensure labels remain keyboard accessible. Add a radial fade and blue-black border glow so the canvas has no visible rectangle.

- [ ] **Step 6: Run tests, build and inspect the local page**

Run: `npm test` and `npm run build`.

Start: `npm run dev -- --port 3111`

Verify: the GLB remains visible, the left copy has clear contrast, the labels do not cover panels, and the five-layer hover/click behavior remains available.

- [ ] **Step 7: Commit the visual system**

```bash
git add components/Hero components/Hero3D components/ArchiveGate styles lib/designTokens.mjs tests
git commit -m "style: apply archive gate color and material hierarchy"
```

### Task 4: Refine the experience, team-value and AI sections

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.js`
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`

**Interfaces:**
- Experience data remains four chronological records from `siteContent`.
- AI practice remains four items and can show an optional visual placeholder without requiring external assets.

- [ ] **Step 1: Add section-level accessibility assertions**

Extend content tests to assert every experience item has `headline`, `description`, and `tags`, and every AI item has `number`, `title`, and `description`.

- [ ] **Step 2: Run the test and verify the new assertions pass against existing data**

Run: `npm test -- tests/content.test.mjs`

Expected: PASS before UI changes.

- [ ] **Step 3: Implement About as a scroll-highlight statement**

Render the two approved positioning sentences plus five keywords. Use CSS scroll-in reveal and keep the text readable without JavaScript.

- [ ] **Step 4: Implement Experience as an editorial horizontal track**

On desktop, cards scroll horizontally within a bounded section; on touch screens, use native horizontal scrolling. Each card shows one headline, role/period, description and tags. Keep the active card visually stronger without hiding other cards.

- [ ] **Step 5: Implement Team Value as four chapter blocks**

Each item gets one large number, one short heading and one explanation. Connect the blocks with a thin archival line rather than a generic icon grid.

- [ ] **Step 6: Implement AI Practice as four evidence cards**

Use small input/process/output labels where available, but keep the copy exact. Use purple/cyan as restrained status accents, not full card gradients.

- [ ] **Step 7: Run build and browser smoke test**

Verify anchor navigation, language switching, keyboard focus, horizontal card scrolling and reduced-motion behavior.

- [ ] **Step 8: Commit the content sections**

```bash
git add components/ArchiveGate tests/content.test.mjs
git commit -m "feat: add archive gate content chapters"
```

### Task 5: Responsive polish and release verification

**Files:**
- Modify: `components/ArchiveGate/ArchiveGateSite.module.scss`
- Modify: `components/Hero/Hero.module.scss`
- Modify: `components/Hero3D/HeroScene.module.scss`
- Modify: `README.md`

- [ ] **Step 1: Add viewport verification checklist**

Document desktop (1440×900), laptop (1280×720), tablet (768×1024), and mobile (390×844) checks in README.

- [ ] **Step 2: Run lint and all tests**

Run: `npm run lint`

Expected: no ESLint errors.

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Build production output**

Run: `npm run build`

Expected: build succeeds with no missing module or page errors.

- [ ] **Step 4: Run the production server and inspect the main route**

Run: `npm run start -- --port 3111`

Verify `http://127.0.0.1:3111/` returns HTTP 200, all section anchors work, and the GLB asset loads from `/models/hero-delivery-system.glb`.

- [ ] **Step 5: Commit the verified release**

```bash
git add README.md components styles pages data lib tests
git commit -m "chore: verify archive gate portfolio release"
```

