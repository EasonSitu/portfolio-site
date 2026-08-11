# Recruiter-first Portfolio Polish Design

## Goal

Improve recruiter scanability, typography consistency, responsive behavior and release hygiene without changing the agreed five-section architecture or visual direction.

## Product contract

- The five primary sections remain `home`, `experience`, `project`, `skills`, and `contact`.
- The initial locale is Traditional Chinese (`zh-HK`); English and Simplified Chinese remain available.
- The site remains recruiter-facing for AI Solution Consulting, Solution Delivery, Implementation and Project Coordination roles.
- AI, AIoT and CIC claims stay factual and bounded.
- CV download, contact links, reduced-motion behavior and coarse-pointer fallback remain available.
- No deployment, push, commit, domain change or invented canonical URL is included.

## Design direction

Keep the calm editorial archive language: paper background, ink text, blue/terracotta accents, rounded cards, workflow visualization and restrained motion. Improve the system underneath it rather than introducing a new visual concept.

## Change strategy

1. Establish shared typography, spacing, container, radius, control and motion tokens.
2. Correct identity and accessibility issues that affect trust before visual polish.
3. Make recruiter-critical information static and readable before optional animation.
4. Validate intermediate widths and short desktop heights, then simplify interactions that do not improve reading.
5. Complete release metadata and functional QA without inventing a public domain or social image.

## Out of scope

- Adding a backend, CMS, Three.js/WebGL, authentication or a new project catalogue.
- Adding a second project without verified source material.
- Replacing the current visual direction.
- Committing, pushing or deploying.
