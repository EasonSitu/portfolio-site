# Editorial Portfolio Polish Design

## Goal

Strengthen the current recruiter-facing B version without changing its factual copy, role positioning, information architecture, or dependency footprint.

## Approved direction

- Keep the editorial ivory-and-ink foundation and trilingual content.
- Keep the page focused on AI solution delivery, project coordination, and implementation rather than frontend engineering.
- Improve memorability with one restrained signature system graphic instead of restoring the Three.js hero.
- Improve proof by turning the AI project modules into a connected system diagram.
- Reduce repeated oversized Chinese headings so content appears sooner.
- Make horizontal experience navigation legible through an active index and progress track.
- Apply scroll-progress text illumination only to three synthesis statements, with reduced-motion and mobile fallbacks.

## Component changes

### Hero solution map

The existing five-step list becomes a compact solution map. All five stages remain visible as nodes, connected by a path. One node is highlighted at a time using a slow CSS-only sequence; hover pauses the sequence and highlights the hovered node. Detailed text is reduced to the active stage's short description. The visual remains understandable without animation.

### Experience feedback

The horizontal snap rail keeps the same four factual cards. A `01 / 04` indicator and progress bar reflect the nearest card. Arrow buttons update the same state. The cards show roughly one full card plus part of the next card on desktop to communicate horizontal movement.

### AI project evidence diagram

The four existing modules are arranged as an input-to-decision flow: speech, object state, and gesture feed into the rules/review outcome. The diagram uses labels and connectors, not invented screenshots or production claims. The existing boundary statement remains visible.

### Scroll text illumination

The career synthesis, recurring-work closing, and AI closing statements use a muted base layer with a foreground layer clipped from left to right by scroll progress. When reduced motion is requested, JavaScript is unavailable, or the viewport is narrow, the text renders normally at full contrast.

## Visual rules

- Hero title remains the largest type.
- Section headings use a smaller ceiling than the hero and a Chinese-specific size ceiling.
- The palette stays paper, ink, violet, and restrained warm metadata; no new saturated colours.
- Interaction labels are enlarged enough to read but only appear over interactive elements.
- No skill icon wall, cartoon illustration, autoplay video, new 3D scene, or new external dependency.

## Acceptance criteria

- English, Simplified Chinese, and Traditional Chinese still render.
- The hero shows five connected workflow nodes and remains readable without motion.
- Experience controls expose current and total card counts and update on scrolling.
- The AI project visual has explicit connectors and a review/outcome node.
- Exactly three synthesis statements use scroll illumination.
- Coarse pointers and reduced-motion users receive a stable, fully readable fallback.
- Existing tests pass and the production build succeeds.
