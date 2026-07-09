# GLYPHWERK — School for Creative Coding

## Full Reproduction Prompt

Build a single-file showcase website for "GLYPHWERK", a fictional Zürich school for creative coding, in a light Swiss-editorial style: newsprint background #F4F2EC, ink text #1B1B1F, international blue accent #2743E0. Google Fonts only: Archivo (black, uppercase editorial headings) and IBM Plex Mono (body, labels, and the artwork itself). No images, no libraries, no WebGL.

Signature piece: a hero canvas showing real-time 3D rendered as ASCII text. Write a tiny software point projector on a 2D canvas: precompute equal-sized point sets (with normals) for a torus, a lat/long sphere, and a cube face grid; rotate them, perspective-project onto a ~110×55 character grid (~64×36 on mobile), z-buffer per cell, shade with a Lambert dot product against a light vector that follows the cursor, and map brightness to the ramp " .:-=+*#%@". Morph between the three solids every few seconds by lerping point sets with smoothstep. Render each frame as whole row strings (one ink layer, one blue highlight layer for the brightest cells) for 60fps; keep DPR at 1; pause offscreen canvases; show a static lit frame under prefers-reduced-motion.

Sections: hero with big headline "Geometry, set in type."; a philosophy manifesto ("the renderer, not the framework"); three courses, each with a small live ASCII canvas (torus/sphere/cube in blue); a described student-work index; an apply section with semester terms; editorial footer. Sharp pedagogic copy throughout, thin blue rules, numbered sections, generous whitespace.
