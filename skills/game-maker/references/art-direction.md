# Art direction

"Sprites are code" is a storage rule. This file is the quality rule.

## Before the first sprite

1. **Collect references.** Ask for two or three images of the look the game should have. Keep them where every agent can open them.
2. **Pick the resolution from the references.** Measure how tall a character is in the reference, in pixels. A 16 px character cannot hold the detail of a 32 px one, however well it is shaded. Changing resolution later means redrawing everything.
3. **Fix the scale model.** `ART` art pixels per sim unit. The canvas backing store is in art pixels with one transform applied; renderer geometry stays in sim units; sprites are authored in art pixels. Doubling the art then touches sprites and anchors, never the sim.
4. **Pick the zoom rule.** An art pixel should cover a whole number of screen pixels at the common sizes. Uneven scaling shimmers when the camera moves.

## The bar

- 3 to 5 tones per material: shadow, mid, light, plus a highlight or rim.
- One light direction for the whole game (top-left is the convention).
- Silhouettes that read at game zoom. Heads about a third of a character's height, not half.
- Varied props. One tree stamped twenty times reads as a pattern, not a forest.
- Calm floors. Noise on the ground competes with the characters standing on it.
- Enemies stay visible in dark scenes: give each a faint light, and a stronger one while it telegraphs an attack.

## How to draw it in code

- **Rigs.** A character is parts (head, torso, arms, legs, cape) posed per frame. Facings and animation frames reuse the parts.
- **Generators.** A shape painter that fills volumes and shades them from the light direction. Noise fields for foliage and stone. Mirrored halves. Recolors for variants.
- **Anchors as data.** Where the hand is, where the feet are, per facing. Held items attach to the hand anchor; nothing floats.
- **Budget.** Rows of palette keys compress well, generators compress better. Load art in its own lazy chunk with its own size cap.

## Life

A static world reads as unfinished even when every sprite is good.
- Idle motion on every character (breathing, cloth).
- Ambient particles per area (motes, embers, drips, petals).
- Weather outdoors, with a rule for when each kind appears.
- Flicker on light sources, ripples on water, sway on foliage.
- Landmarks carry motion that says what they are: smoke at a forge, cloud under a floating island.
- Fixed-size pools, no allocation, a cap on draws per frame.
- Under `prefers-reduced-motion`: no shake, no blinking, particles thinned to near nothing.

## Interface

Menus are part of the art. Frame them in the game's materials, color item slots by rarity, and draw item icons at a size that can hold shading.
