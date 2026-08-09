# Portfolio Density, Colour and Experience Motion Design

## Goal

Keep the current recruiter-facing content and multilingual structure, while making the page calmer, more intentional and less template-like. The revision must improve scanability first, then add one polished motion system to the experience section.

## Approved direction

- Retain the editorial ivory foundation and the current factual copy.
- Reduce simultaneous visual information: one dominant message, one supporting block and one action group per viewport whenever practical.
- Use three expressive colours only: cobalt blue, terracotta and deep ink. Ivory and pale neutral surfaces remain supporting neutrals rather than extra accent colours.
- Borrow the references' negative space, paper warmth, rounded layers and route-like visual rhythm without copying Chinese ink painting, seals, 3D medals or literal stepped roads.
- Rebuild the desktop experience section as a slow, scrubbed horizontal story driven by natural vertical scrolling.
- Keep mobile and reduced-motion versions straightforward and native.

## Design system rules

### Colour

- Canvas: warm ivory `#f4f0e7`.
- Primary ink: blue-black `#17212b`.
- Primary accent: cobalt `#174ea6`.
- Secondary accent: terracotta `#c75a34`.
- Supporting surfaces may use low-saturation blue, clay and cream tints derived from the three colours above.
- Violet is removed as a primary UI accent so that interactive elements and experience cards share one coherent palette.

### Density and spacing

- Major sections receive at least `clamp(8rem, 12vw, 12rem)` vertical separation on desktop.
- Text blocks use controlled line lengths: 18ch–24ch for display copy and 46ch–62ch for body copy.
- Section introductions and their primary content are separated by at least 3rem.
- Cards use generous internal padding and do not stretch to fill every available pixel.
- Decorative elements remain sparse and must never compete with headings or evidence.

### Typography

- Preserve the existing calibrated type scale from the previous revision.
- Display headings remain decisive but must not exceed the viewport or create three-line walls by default.
- Body text uses more line height and slightly lower contrast to create breathing room.
- Metadata remains compact, but is not reduced below a comfortable reading size.

## Experience section

### Motion model

- Desktop vertical scroll controls the horizontal translation of a single rail.
- The rail moves with a small scrub delay instead of assigning raw `scrollLeft` on every scroll event.
- The vertical travel distance is derived from the real horizontal overflow so the speed remains consistent across viewport sizes.
- The stage remains sticky while the rail translates; scrolling is never blocked or intercepted.
- Progress, active-card state and arrow controls remain synchronized with the same motion timeline.
- Desktop scroll snapping is removed because it conflicts with scrubbed translation.

### Card form

- Cards use 22px–28px corner radii, subtle borders and soft, offset shadows.
- Desktop cards are narrower than the viewport so the next card is visibly available; aim for roughly 1.6–2.1 cards in view.
- Each card receives one tonal surface: cream, mist blue or pale clay. The colour rotation supports wayfinding without becoming decorative noise.
- A short coloured route marker or top rule identifies the card's stage; no large full-card outline is used for the active state.
- Content order stays: index/date, responsibility title, employer/role, concise evidence, tags.
- Description width is constrained and tags remain secondary.

### Fallbacks

- At tablet/mobile widths, cards return to native horizontal scrolling with optional snap points.
- With `prefers-reduced-motion`, the scrubbed transform is disabled and the cards remain directly browsable.
- Keyboard and arrow controls stay available.

## Acceptance criteria

- The page uses cobalt, terracotta and ink as its only strong colours.
- Major sections visibly breathe and no section feels packed edge-to-edge.
- Experience cards are clearly rounded and visually layered, not plain rectangular panels.
- Desktop wheel/trackpad scrolling moves the rail gradually left with a perceptible but controlled delay.
- The experience motion does not fight scroll snapping or trap the user.
- Mobile and reduced-motion users can browse every card without the pinned effect.
- English, Simplified Chinese and Traditional Chinese remain intact.
- Existing factual copy and career positioning are unchanged.
