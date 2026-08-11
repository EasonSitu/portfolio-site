# Portfolio Website Continuation Handoff

## 1. Project purpose

This is Zhicheng Situ's recruiter-facing portfolio for the current Hong Kong job search.

Primary role directions:

- AI Solution Consultant
- Solution Delivery / Implementation
- Project Coordination / Project Management
- Applied AI and digital transformation roles

The site should present someone who understands business context, clarifies requirements, coordinates stakeholders, tests solutions and moves work into delivery. It must not frame him as only IT support, a site technician, a deep-learning engineer or an IoT architect.

## 2. Current implemented state

The production page has already been reorganised into exactly five primary sections:

1. Hero
2. Work Experience
3. Selected Projects
4. Skills / What I Can Do
5. Contact

Completed work includes:

- Responsive gutters and typography for 320, 375, 768, 1024 and 1440 px viewports.
- English, Simplified Chinese and Traditional Chinese content paths.
- The former About content was merged into capability-oriented sections.
- Selected Projects retains the current CIC applied-AI feasibility prototype.
- Favicon request and browser-console error were fixed.
- Reduced-motion and cursor accessibility behaviour were preserved.

Verification completed on 2026-08-11:

- Production build passed.
- Automated tests passed: 42 / 42.
- Sass compilation and repository diff checks passed.
- EN / zh-CN / zh-HK were checked at all five target widths.
- Horizontal overflow: 0.
- Five-section order: correct.
- Browser console errors: 0.

## 3. Repository state — preserve it

Working directory:

`D:\codex\Eason\portfolio-site`

Baseline branch and commit before the current work:

- Branch: `main`
- Commit: `956e03c`

The current implementation is intentionally uncommitted. Do not reset, discard or rebuild it from scratch.

Modified source files:

- `components/ArchiveGate/ArchiveGateSite.js`
- `components/ArchiveGate/ArchiveGateSite.module.scss`
- `data/content.mjs`
- `lib/pageContract.mjs`
- `pages/index.js`
- `tests/archive-gate-interactions.test.mjs`
- `tests/content.test.mjs`

Local build recovery folder:

- `.next-stale-20260811`

This folder is not source code and must not be committed.

## 4. How to run and inspect

Normal development launch:

```powershell
cd D:\codex\Eason\portfolio-site
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1
```

Normal local URL:

`http://127.0.0.1:3000/`

The previous validation instance may still be available at:

`http://127.0.0.1:3010/`

Do not assume either server is still running; verify before using it.

## 5. Content and product contract

- Keep exactly five primary sections unless the user explicitly changes the information architecture.
- Experience should communicate the progression from product research and requirements, to software project coordination, to real-world digital-solution delivery.
- AI must remain visible in every language, but claims must stay factual.
- The CIC work is an applied-AI feasibility prototype supporting examiner review, not a production automated scoring platform.
- Describe multi-device IoT work as deployment/integration coordination, commissioning, testing and issue resolution; do not claim ownership of deep architecture work.
- Skills should explain what the candidate can handle, not become a dense tool wall.
- Contact should be concise and invite relevant conversations.
- Preserve the three-language switch, CV download route, responsive layout, reduced motion and accessible native-pointer fallback.

## 6. Visual direction already agreed

The intended visual character is:

- senior, calm and recruiter-readable;
- spacious rather than dense;
- professional with restrained interaction details;
- two or three coordinated colours rather than a monochrome wall or a colourful collage;
- smooth motion with a clear reading hierarchy;
- rounded, differentiated experience/project cards rather than generic rectangular blocks.

Avoid adding Three.js, WebGL, a CMS, a backend or a new visual concept unless the user asks for it. Improve the selected direction instead of restarting visual exploration.

## 7. Remaining work

1. Open the current implementation and visually review it with the user.
2. Apply the user's next design or content feedback while preserving the five-section structure.
3. After material changes, rerun build, tests and trilingual responsive checks.
4. When the user is satisfied, organise the Git commit/push as a separate explicit step.
5. Deployment to the user's Vultr server and domain can follow later, with confirmation before publishing or changing external infrastructure.

## 8. Working approach

- Continue from the existing implementation; do not redo completed work.
- Make scoped changes, verify them and report evidence.
- There is no forced time limit, tool-call limit or retry-count stop rule.
- Continue until the requested scope is complete. Pause only for a genuine blocker, missing user decision that materially changes the result, or a need for new authority.
- If the conversation itself becomes unwieldy, the user will decide whether to create another task.
