# Trilingual Devfolio Portfolio Design

## Goal

Build a fast, recruiter-facing personal website for Zhicheng Situ by selectively adapting the MIT-licensed `shubh73/devfolio` animation language. The site must explain his positioning within five seconds, retain visible AI evidence without overstating engineering depth, and support English, Simplified Chinese, and Traditional Chinese.

## Audience and positioning

- Primary audience: recruiters and hiring managers who have already seen the CV.
- Positioning: AI and digital solution delivery professional who connects business needs, technical teams, and real-world implementation.
- Evidence boundary: emphasize solution delivery, product/requirements work, software coordination, testing/UAT, multi-device AIoT deployment coordination, and practical AI prototypes. Do not present the candidate as an AI model engineer, solution architect, or low-level IoT integration developer.

## Scope

### Included in the MVP

1. Short loading transition, capped at 1.2 seconds.
2. Recruiter-scannable hero with name, positioning, CTA links, and an original signal-flow visual.
3. Three-language switcher: `EN`, `简`, `繁`.
4. Scroll-highlighted positioning statement.
5. Evidence metrics and capability labels.
6. Sticky/scroll-linked professional experience for isBIM, Questwork, K Compact, and earlier product experience.
7. Compact AI practice section covering knowledge base work, workflow automation, packaged Python tools, and YOLO/OpenCV/MediaPipe prototyping.
8. Animated work-method strip: Discover, Clarify, Coordinate, Test, Deliver, Improve.
9. Education, languages, email, LinkedIn, and CV download.
10. Desktop custom cursor and progress indicator, with reduced-motion and mobile fallbacks.

### Excluded from the MVP

- Selected Work or project case-study cards.
- Separate project-detail pages.
- WebGL/Three.js.
- Contact form, CMS, backend, or database.
- Autoplay music or sound effects.
- Skills logo wall.

## Visual system

- Background: near-black.
- Primary accent: electric violet.
- Secondary accent: cool cyan/blue.
- Text: white and neutral gray.
- Typography: modern sans-serif for content, monospace for labels and metrics.
- Personal motif: animated signal paths connecting Business, Technology, and Delivery nodes.
- Motion language retained from Devfolio: staged hero reveal, scroll-triggered text emphasis, sticky experience transitions, marquee-like workflow motion, subtle custom cursor, and animated CTA.

## Page structure

### 1. Loader

Reveal `BUSINESS`, `TECHNOLOGY`, and `DELIVERY`, then connect the three nodes. Skip artificial waiting when the page is ready.

### 2. Hero

- English title: `AI & Digital Solution Delivery`
- Simplified title: `AI 与数字化方案交付`
- Traditional title: `AI 與數碼方案交付`
- English statement: `Connecting business needs, technical teams, and real-world delivery.`
- Simplified statement: `连接业务需求、技术团队与实际落地。`
- Traditional statement: `連接業務需求、技術團隊與實際落地。`
- CTAs: View Experience, Download CV, LinkedIn, Email.
- Right-side visual: original animated signal map, not Devfolio's programmer Lottie.

### 3. Positioning statement

Use scroll-linked opacity and color progression for two sentences explaining the candidate's ability to turn ambiguous requirements into deliverable solutions and coordinate clients, product, and technical delivery.

### 4. Evidence metrics

- `20+` AIoT and digital projects.
- `5` end-to-end deliveries.
- `1,000+` connected devices supported.
- `AI` workflow and rapid prototyping.

The metric wording must remain supportable by the final CV.

### 5. Experience

Use a sticky-scroll interaction. The active entry controls the description and visual marker.

1. isBIM Limited — AIoT/digital solution delivery, testing, commissioning, UAT, training, SOPs, AI-assisted workflows, and coordination across clients, consultants, contractors, suppliers, and technical teams.
2. Questwork Consultation Company — clinic-system software delivery, sprint coordination, user stories, functional testing, UAT, and release documentation.
3. K Compact Company Limited — restarted and restructured a paused pet telemedicine product using stakeholder interviews, legacy-material review, business analysis, BRD/process/UI outputs, and development coordination.
4. Earlier Product Experience — product research, requirements, iteration support, and analytics foundation.

### 6. AI practice

Show four concise evidence tiles without case-study pages:

- AI knowledge base and structured information.
- AI-assisted workflow automation.
- Packaged Python utilities.
- Computer-vision prototype using YOLO, OpenCV, and MediaPipe.

### 7. Work method

Animate the sequence `DISCOVER → CLARIFY → COORDINATE → TEST → DELIVER → IMPROVE`, plus a secondary moving line of stakeholders and technology areas.

### 8. Education and contact

Show Australian National University, Bachelor of Information Technology, Cantonese/Mandarin/English, email, LinkedIn, and CV download. Use a `mailto:` CTA; no backend form.

## Internationalization

- All visible copy lives in one structured content module keyed by `en`, `zh-CN`, and `zh-HK`.
- Default locale is English unless a saved preference exists.
- Locale choice is stored in local storage.
- Switching locale must not reload the page or reset scroll position.
- Simplified and Traditional Chinese are independently authored, not runtime machine conversion.

## Responsive and accessibility behavior

- Desktop: full custom cursor, sticky experience, progress indicator, and all scroll choreography.
- Mobile/tablet: disable custom cursor, simplify sticky behavior into vertical cards, reduce large transforms, preserve content order.
- Respect `prefers-reduced-motion` and show content immediately when motion is reduced.
- Maintain keyboard-focus styles and semantic headings.
- Never hide essential information behind hover-only interaction.

## Technical architecture

- Base: fork/adapt `shubh73/devfolio` under its MIT license.
- Framework: Next.js and React.
- Styling: Tailwind CSS plus focused SCSS modules.
- Animation: GSAP/ScrollTrigger for staged and scroll-linked effects; Framer Motion only for the sticky experience state where it is already a good fit.
- Data: static multilingual content module.
- Assets: original SVG/CSS signal artwork and the current V2.2 PDF resume.
- Deployment target: static-friendly hosting such as Netlify; deployment is outside this MVP unless requested.

## Attribution

Preserve the MIT license and copyright notice. Add a discreet footer credit linking to the original Devfolio repository because the implementation is materially derived from it.

## Acceptance criteria

1. A recruiter can identify name, direction, and value proposition within five seconds.
2. EN/简/繁 switches every visible section without reload.
3. No Selected Work/project carousel is present in the MVP.
4. AI evidence is visible but no unsupported AI engineering claim is introduced.
5. Desktop motion clearly resembles Devfolio's choreography without retaining its developer-specific content or artwork.
6. Mobile content remains readable and ordered without horizontal overflow.
7. `npm run build` succeeds.
8. Automated content tests confirm all three locales expose the required sections and external links.
9. The final page is visually inspected at desktop and mobile widths.
