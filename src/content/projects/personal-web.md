---
title: 'personal-web'
year: 2026
brief: 'A personal site built with Astro from a blank canvas — content collections, a hand-rolled design system, and a canvas-based particle field, no starter template.'
role: 'solo project'
stack: ['Astro', 'TypeScript', 'CSS']
highlights:
    - 'Custom canvas particle field with depth, rotation, and mouse repulsion — no animation library'
    - 'Astro content collections driving both the homepage cards and the /projects detail page from one schema'
    - 'Hand-built design system: type scale, spacing, and color tokens defined from scratch'
links: {}
featured: true
---

This site exists to learn Astro hands-on, not from a tutorial sandbox — every piece, from the content collection schema to the render loop behind the hero canvas, is something I built and understood rather than something a starter template gave me.

The homepage and /projects page are both driven by a single project schema, so writing a new entry is the only step needed to get a card on the homepage and a full write-up on the detail page. The hero itself is a from-scratch canvas particle field — circles with fake depth and rotation that respond to the cursor — built without an animation library, so the render loop, physics, and interaction logic are all mine.
