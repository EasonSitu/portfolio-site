# Zhicheng Situ Portfolio — Visual Redesign Handoff

## 1. Assignment

This repository contains a working trilingual recruiter-facing portfolio MVP. The information architecture, content model, language switching, responsive implementation, and main GSAP interactions already work.

The next task is **visual and interaction refinement**, not another resume rewrite.

The current version demonstrates most requested effects, but the overall art direction still feels too much like a generic black-and-purple developer portfolio. Improve the visual quality, hierarchy, typography, composition, and sense of personality while keeping the site fast and recruiter-friendly.

Primary outcome:

> A recruiter should understand the candidate within 30–60 seconds, remember the visual identity, and still be able to scan the content without fighting the animation.

## 2. Audience and positioning

### Primary audience

- Hong Kong recruiters and hiring managers
- AI solution delivery, implementation, digital transformation, product operations, and technical project teams

### Intended impression

Zhicheng is not presented as a senior software engineer, AI researcher, or low-level IoT engineer. His strongest and most defensible story is:

> He connects business needs, technical teams, and real-world delivery; he can clarify ambiguous problems, coordinate implementation, test solutions, and use AI tools to create practical prototypes and more efficient workflows.

Smart-site experience is evidence of delivery in complex operational environments. It must not become the entire identity of the site.

## 3. Current state

### Implemented

- English, Simplified Chinese, and Traditional Chinese
- Browser-language fallback and saved language preference
- Responsive desktop and mobile layouts
- Intro loader
- Fixed navigation
- Hero reveal animation
- Business → Technology → Delivery signal map
- Large positioning statement
- Evidence metrics and capability summary
- Scroll-driven/sticky work experience section
- AI practice cards
- Animated workflow marquees
- Contact, education, languages, email, and CV download
- Reduced-motion handling
- Static site; no backend or database

### Verified

- 11 automated content and locale tests pass
- Next.js production build passes
- Mobile layout has no horizontal overflow at 390 px
- All three language switches work in the browser

### Current reference screenshots

- `output/preview/hero-final.png`
- `output/preview/mobile-zh-hk.png`
- `output/preview/experience.png`

## 4. Main aesthetic problems to solve

These are design hypotheses, not instructions to blindly restyle everything. Inspect the current result before changing it.

1. **Generic visual identity**
   - Black background, purple glow, orbit diagram, monospace labels, and large ghost text feel familiar from many developer portfolios.
   - The site needs a more recognisable identity tied to the candidate’s actual strength: structuring ambiguity and moving work from business problem to implementation.

2. **Too much darkness and too little material contrast**
   - Large parts of the page merge into the same near-black plane.
   - Sections need clearer rhythm through controlled changes in surface, scale, typography, grid, texture, or colour—not more random decoration.

3. **Chinese typography needs stronger art direction**
   - The English display font has character, while Chinese relies more heavily on fallback fonts.
   - Simplified and Traditional Chinese must feel intentional rather than like translated text placed inside an English template.

4. **The hero visual is conceptually correct but aesthetically literal**
   - Business / Technology / Delivery communicates the positioning, but the current orbit diagram feels like an explanatory infographic.
   - Explore a more elegant representation: signal routing, layered systems, modular blocks, an editorial diagram, spatial objects, or controlled kinetic typography.

5. **Repeated component language**
   - Metrics, capability rows, AI cards, tags, and experience panels use similar thin borders and dark cards.
   - Create more variation while preserving a coherent design system.

6. **Animation should support hierarchy**
   - Keep the Devfolio-like motion energy, but do not animate every element in the same reveal pattern.
   - Use distinct motion roles: entrance, orientation, transition, and feedback.
   - Avoid long delays before the recruiter reaches useful information.

7. **Experience section needs special attention**
   - It contains the most important evidence but can feel visually sparse or awkward during some sticky-scroll positions.
   - Improve the transition between company index and detail panel, and ensure direct navigation to `#experience` produces a coherent first frame.

8. **Custom cursor is optional**
   - Keep it only if it improves the experience. It must not visually compete with buttons or language controls.

## 5. Recommended visual directions

Do not combine all three. Select one coherent direction and execute it deeply.

### Direction A — Editorial systems portfolio

Keywords: precise, mature, structured, high-contrast typography, Swiss/editorial grid, restrained motion.

- Use a warmer off-black or light/dark alternating editorial canvas.
- Replace generic cards with typographic layouts, rules, numbered systems, and strong spacing.
- Use one vivid accent colour instead of several competing glows.
- Let experience read like a well-designed case-study index.
- Best fit for recruiters and Hong Kong corporate/technology roles.

### Direction B — Spatial signal objects

Keywords: modular objects, floating blocks, depth, signal flow, polished creative technology.

- Draw inspiration from the spatial feeling of Noomo Showcase and Organic Sphere without cloning either site.
- Each block can represent a capability or experience; motion reveals relationships between them.
- Prefer CSS 3D, SVG, GSAP, or lightweight Canvas before introducing a heavy WebGL stack.
- The content must remain readable even if motion is disabled.

### Direction C — Hong Kong operational systems

Keywords: dense city systems, wayfinding, transport/technical signage, steel/glass/paper, local but not stereotypical.

- Build a visual language from systems, routes, labels, handover marks, and operational layers.
- Avoid construction-site clichés such as hazard stripes, blueprint backgrounds, or excessive industrial icons.
- Can feel distinctive while still supporting solution delivery and digital transformation roles.

## 6. Non-negotiable content constraints

### Keep

- Three languages: `en`, `zh-CN`, `zh-HK`
- CV download
- Email contact
- The overall content sequence unless there is a clearly argued UX reason to reorder it
- Recruiter scanability
- Mobile responsiveness
- Reduced-motion support
- Original Devfolio MIT attribution

### Do not invent or exaggerate

- No unverified LinkedIn URL
- No claim that the candidate developed low-level IoT integrations
- IoT wording should stay around coordinating multi-device solution deployment, implementation, testing, commissioning, and issue resolution
- No claim of advanced AI model training, algorithm research, cloud architecture ownership, or senior engineering depth
- AI evidence is application-oriented: knowledge base, workflow automation, packaged Python tools, web prototypes, and a YOLO/OpenCV/MediaPipe computer-vision demo
- Do not alter dates, company names, numerical evidence, or responsibility boundaries without approval

### Projects

There is intentionally no Selected Work section in this MVP. Do not create fictional project case studies or placeholder project cards. The project section will be added later when evidence and visuals are ready.

## 7. Content source of truth

All recruiter-facing copy is centralised in:

- `data/content.mjs`

Language logic is in:

- `utils/i18n.mjs`

Do not scatter translated copy back into JSX. If a redesign needs a new label or section, add matching fields to all three locales and update the tests.

## 8. Code map

- `pages/index.js` — page entry and locale selection
- `pages/_app.js` — global font and style wrapper
- `components/Portfolio/Portfolio.js` — current page structure and GSAP/ScrollTrigger behaviour
- `components/Portfolio/Portfolio.module.scss` — current visual system and responsive layout
- `components/Cursor/Cursor.js` — optional custom cursor
- `styles/globals.scss` — reset, scrollbar, selection, global progress bar
- `data/content.mjs` — all English, Simplified Chinese, and Traditional Chinese content
- `utils/i18n.mjs` — locale resolution and persistence
- `tests/content.test.mjs` — content completeness and evidence checks
- `tests/i18n.test.mjs` — language behaviour
- `public/Zhicheng-Situ-CV.pdf` — downloadable CV
- `LICENSE.md` — retained MIT licence

## 9. Technical environment

- Next.js 14 Pages Router
- React 18
- SCSS modules and Tailwind utilities
- GSAP + ScrollTrigger
- Framer Motion is installed but not required
- Static implementation; no API, CMS, authentication, or database

Typical commands:

```bash
pnpm install
pnpm dev
pnpm test
pnpm build
```

If using this Windows machine’s bundled runtime, the project has already been installed and built successfully.

## 10. Redesign workflow expected from the next model

1. Open the current local site and inspect desktop and mobile before editing.
2. Pick one visual direction and write a short rationale.
3. Define design tokens first:
   - colour palette
   - typography stack for Latin, Simplified Chinese, and Traditional Chinese
   - spacing scale
   - surface/border rules
   - motion principles
4. Produce a text description or static mockup of the revised hero and one content-heavy section.
5. Get approval before rewriting the whole visual system if working interactively with the user.
6. Implement the approved direction without changing factual content.
7. Test all three languages and at least these viewports:
   - 1440 × 1000
   - 1024 × 768
   - 390 × 844
8. Run the full verification suite.
9. Provide before/after screenshots and list substantive visual decisions.

## 11. Acceptance criteria

The redesign is ready for review when:

- The first screen identifies the candidate, positioning, and next action within five seconds.
- English, Simplified Chinese, and Traditional Chinese each look intentionally composed.
- No text overlaps, clips, or causes horizontal scrolling.
- Work experience is understandable without waiting for animation.
- Animation remains smooth and useful, and reduced-motion mode remains usable.
- No factual content or capability boundary has drifted.
- `pnpm test` passes.
- `pnpm build` passes.
- Desktop and mobile screenshots are supplied.

## 12. Useful external references

- Original animation/code base: `https://github.com/shubh73/devfolio`
- Devfolio demo: `https://shubhporwal.me`
- Spatial interaction reference: `https://showcase.noomoagency.com/`
- Organic motion reference: `https://organic-sphere.vercel.app/`

Use these references for principles and interaction quality, not for direct visual copying.

## 13. Suggested prompt for another model

```text
You are improving the visual design of an existing trilingual recruiter-facing portfolio.

Read HANDOFF.md and inspect the current implementation and screenshots before editing. The content, evidence boundaries, language system, and information architecture are already approved. Your task is visual art direction and interaction refinement, not resume rewriting.

First propose one coherent visual direction, including palette, typography, layout rhythm, hero concept, experience-section treatment, and motion principles. Explain which current aesthetic problems it solves. Do not implement until the direction is clear. Preserve all factual content and all three locales. Do not invent projects or unverified links.
```
