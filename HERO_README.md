# Hero Section Prototype

## Preview

Open `hero-preview.html` in your browser to see the Hero section immediately.

## Features Implemented

### Structure
- Left side: Title, subtitle, CTA buttons
- Right side: Multi-layer floating structure with 5 panels

### Visual Design
- Deep black background
- Purple accents (#805ad5, #b794f4)
- Golden pillar and orb (#d4af37, #f0d060)
- Glass-morphism panels with subtle borders

### Animations

#### Default State
1. **Panel Float**: 5 panels slowly float up/down with slight rotation
2. **Pillar Breathing**: Golden pillar glows with subtle pulse
3. **Orb Pulse**: Bottom orb gently expands/contracts
4. **Panel Shine**: Light sweep across panels

#### Panel Interaction
- Hover: Panel edge highlights, slight movement
- Click: Temporary golden border glow

#### Mystery Box (Click the Golden Orb)
5 random animations with weighted probability:

| Animation | Probability | Description |
|-----------|-------------|-------------|
| Golden Downstream | 35% | Light flows down the base path |
| Vertical Breakthrough | 25% | Energy shoots up through all panels |
| Impact Ripple | 20% | Expanding golden ripples |
| Particle Rise | 15% | Golden particles float upward |
| Seal Projection | 5% | Rare "DELIVERED" stamp appears |

### Responsive Design
- Desktop: Side-by-side layout
- Tablet: Stacked layout
- Mobile: Simplified structure, smaller panels

## Next.js Implementation

The React components are in:
- `components/Hero/Hero.js` - Main component
- `components/Hero/Hero.module.scss` - Styles

To run the full Next.js app:
```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Customization

### Colors
Edit the SCSS variables at the top of `Hero.module.scss`:
```scss
$purple-primary: #805ad5;
$gold-primary: #d4af37;
$text-primary: #faf9f7;
```

### Panel Labels
Edit the `PANEL_LABELS` array in `Hero.js`:
```js
const PANEL_LABELS = [
  "Business Context",
  "Requirements",
  "Coordination",
  "Testing",
  "Delivery",
];
```

### Animation Probabilities
Edit the probability thresholds in the `triggerAnimation` function:
```js
if (rand < 0.35) animType = "goldenDownstream";
else if (rand < 0.6) animType = "verticalBreakthrough";
// ...
```
