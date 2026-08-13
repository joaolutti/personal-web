---
title: 'computer graphics'
year: 2025
brief: 'A semester of computer graphics assignments in C++ and OpenGL — building up the rendering pipeline, camera math, and lighting models from first principles.'
role: 'university coursework'
stack: ['C++', 'OpenGL', 'GLSL']
highlights:
    - 'Built the rasterization pipeline by hand, including triangle rasterization and z-buffering'
    - 'Implemented model, view, and projection matrix transforms and camera controls from scratch'
    - 'Per-vertex and per-pixel Phong shading with configurable materials and lights'
links:
    source: 'https://github.com/joaolutti-study/computer-graphics'
featured: true
---

This repo holds a semester's worth of computer graphics assignments, built in C++ against raw OpenGL rather than a higher-level engine. The value wasn't really the assignments themselves — it was being forced to sit with the math that every graphics abstraction normally hides: what a model/view/projection matrix is actually doing, why homogeneous coordinates make perspective divide work, how a rasterizer decides which triangle owns a pixel.

Working close to the GPU also made lighting and shading concrete instead of theoretical — implementing Phong shading by hand made the difference between per-vertex and per-pixel lighting obvious in a way no lecture slide did. It's the class that made the rest of the 3D and graphics work I've touched since feel like applied math rather than magic.
