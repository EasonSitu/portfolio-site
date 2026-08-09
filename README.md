# Zhicheng Situ Portfolio

Recruiter-facing, trilingual portfolio for Zhicheng Situ.

## Features

- English, Simplified Chinese and Traditional Chinese
- Recruiter-first editorial layout for solution delivery and project coordination roles
- Typewriter introduction, delayed custom cursor and lightweight reveal motion
- Desktop vertical-to-horizontal experience timeline with a mobile swipe fallback
- Recruiter-scannable experience, evidence and AI-practice sections
- Static CV download and contact links; no backend required

## Local development

Install dependencies and run the Next.js development server.

If `pnpm` is not available in a normal PowerShell session, run the bundled launcher from the project root:

```powershell
& .\scripts\start-dev.ps1
```

The equivalent direct command is:

```powershell
$env:PATH = "C:\Users\Eason\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;$env:PATH"
& "C:\Users\Eason\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" dev
```

## Release checklist

Before publishing a visual change, verify the page at these viewport sizes:

- Desktop: 1440 x 900 and 1280 x 720
- Tablet: 768 x 1024
- Mobile: 390 x 844

Check that the following still work:

- The hero introduction, typewriter line and delivery workflow remain readable in all three languages.
- The custom pointer hides the native cursor on precise-pointer devices and is disabled for coarse pointers or reduced motion.
- Header anchors reach Experience, About, AI Practice and Contact without clipping.
- The language switch updates visible copy and the document language attribute.
- Vertical scrolling advances the desktop experience timeline; cards remain swipeable on narrow screens.
- Reduced-motion mode removes reveal and cursor motion without hiding content.
- Contact links and the downloadable CV still point to valid destinations.

## Credits

This implementation is materially adapted from [Devfolio by Shubh Porwal](https://github.com/shubh73/devfolio), distributed under the MIT License. The original copyright and license notice are preserved in `LICENSE.md`.
