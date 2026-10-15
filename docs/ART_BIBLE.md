# Art Bible — Luminous Pixel-Faceted Fantasy

**Status: WORKING VISUAL DIRECTION.** The broad mood is owner-requested; exact rendering settings and palette values are starting points to tune in a playable look-dev scene.

## 1. Visual north star

Translate the supplied valley-vista reference into a more clearly pixelated 3D world: a high, sunlit viewpoint over emerald hills and a reflective cyan-blue river, a compact village with warm ochre roofs, bridges and a windmill, distant blue mountain ridges, and an ancient castle perched on a far rocky summit. A lone traveler and a rough wooden sign frame the foreground. Large pixel-clustered clouds fill a brilliant blue sky.

The target should feel like a miniature world painted with chunky pixels and sculpted from simplified 3D forms—not realistic 3D with a generic pixel filter. Preserve depth, perspective, faceted silhouettes, painterly color grouping, and luminous lighting while making pixel clusters more apparent.

**Mood words:** sunny, adventurous, welcoming, pastoral, colorful, handcrafted, quietly mysterious, readable from a distance.

**Tonal rule:** serenity is allowed to be sincere. Do not make every scene muddy, grim, desaturated, foggy, or ominous.

## 2. Style recipe

Combine these ingredients:
- **3D depth:** a navigable world with real perspective, layered terrain, parallax, and believable light direction.
- **Faceted forms:** simplified geometry with broad planes and recognizable silhouettes.
- **Pixel-first rendering:** a deliberately low internal resolution, nearest-neighbor upscaling, clustered pixel detail, and restrained dithering where it improves gradients.
- **Painterly color design:** broad areas of warm sunlight and cool shadow; avoid noisy textures and random color speckles.
- **Readable staging:** foreground framing, clear midground destination, and layered distant landmarks.

The reference image has a rich painterly surface and broad forms. Our version should push the pixel treatment further: larger deliberate pixel clusters, crisper stair-step edges, simplified cloud contours, and fewer tiny texture details. Avoid making the whole scene so coarse that NPC expressions, interactable objects, or narrow paths become unreadable.

## 3. Palette

These hex swatches are starting points, not locked color constants. Tune them together under the target lighting.

| Role | Starting swatch | Use |
|---|---|---|
| Deep forest | #205B4D | Canopy interiors, deep foliage |
| Emerald | #25885B | Main foliage and shaded grass |
| Sunlit green | #71B94B | Open meadow |
| Lime/chartreuse | #C7D94D | Grass and leaves in direct sun |
| Deep teal | #174B4C | Cool shadow accents |
| Sky blue | #62B3F1 | Clear daylight sky |
| Pale azure | #A4D9F1 | Haze, distant sky, water glints |
| River cyan | #49B8D2 | Sunlit water |
| River blue | #347FAF | Deeper water and reflections |
| Warm ochre | #D8A34E | Sunlit earth, roofs, timber highlights |
| Sandy gold | #EBC66F | Bright path and sunlit stone |
| Muted orange | #B97843 | Roofs and warm wood variation |
| Warm bark | #684A35 | Tree trunks, dark timber |
| Umber | #47372D | Deep wooden forms |
| Slate blue | #6487B8 | Mountains and distant architecture |
| Cool blue-gray | #536D8F | Ruins, rock shadows |
| Cloud cream | #F6E8CA | Sunlit clouds |
| Cloud shadow | #B7D6E7 | Cool cloud planes |

Palette rules:
- Most outdoor scenes should be saturated, warm, and luminous.
- Use yellow-green accents only where the sun justifies them; avoid a uniformly fluorescent landscape.
- Shadow colors should shift cooler rather than merely becoming black.
- Distant terrain loses contrast and detail toward blue-gray.
- Buildings should read as warm anchors against the green-blue landscape.
- Night, storms, dungeons, and story anomalies may change palette, but should not erase the game's color identity.

## 4. Composition rules from the reference

For wide scenic shots:
1. Use a foreground frame such as a tree canopy, signpost, rocks, or the traveler.
2. Guide the eye along a winding path or river into the settlement.
3. Give the player a strong human-scale destination in the midground.
4. Place one memorable adventure landmark on the distant skyline.
5. Use overlapping hills and mountain ridges to sell depth.
6. Let a bright sky and large cloud masses provide breathing room above the landscape.

Do not copy the reference's exact layout for every location. Reuse the composition language, not a single scene template. In playable areas, protect path readability and camera sightlines; framing props must not obscure traversable routes or NPCs.

## 5. Pixelation and rendering targets

The exact output resolution is an experiment for the first look-dev ticket. Try a small set of internal resolutions such as 320×180, 426×240, and 480×270 at a 16:9 viewport, using integer or otherwise stable nearest-neighbor upscaling. Select based on image readability at the intended camera distance, not nostalgia alone.

Technical/art rules:
- Use a low-resolution render target or an equivalent controlled pixel pipeline.
- Upscale with nearest-neighbor sampling; do not rely on browser screenshot scaling to create the style.
- Tune internal resolution independently from CSS viewport size and device pixel ratio.
- Prevent blurred texture filtering from undermining the pixel clusters.
- Use texture atlases and palette discipline where useful, but don't force every material into the same flat texture.
- Treat dithering as a subtle tool for selected gradients or atmospheric transitions, not a universal overlay.
- Test foliage, thin fences, diagonal paths, water highlights, character silhouettes, and small UI at actual gameplay scale.
- Avoid excessive screen-space outlines, chromatic aberration, CRT scanlines, and post-processing stacks by default.

## 6. Geometry and materials

- Use low-to-mid polygon forms with deliberately placed facets; avoid both photorealistic micro-detail and indiscriminately low-poly toy shapes.
- Terrain should use readable hill masses and carefully grouped vegetation, not evenly scattered asset noise.
- Trees need a distinct trunk/canopy silhouette, layered clumps, and sun-facing color planes.
- Rocks should have broad planes and a small palette of warm faces and cool shadows.
- Roofs, timber, stone, and plaster should remain distinct at a distance.
- Water needs a readable surface, clear shore boundaries, large calm color shapes, and small pixelated highlights rather than a noisy normal-map shimmer.
- Cloud masses should be large, soft in silhouette but stepped at the pixel level, with warm bright tops and cool undersides.
- Keep detail density lower in distant terrain and higher near player interaction points.

## 7. Lighting and atmosphere

Default outdoor target: bright midday to golden-afternoon sunlight, a clear azure sky, warm key light, readable cast shadows, gentle atmospheric perspective, and restrained bloom.

The distant castle may be cool and hazy but must remain a recognizable silhouette. Use ambient color and sky contribution to keep shadows legible. Avoid overblown white clouds, washed-out grass, excessive fog, and dark outlines around everything.

Lighting should support time-of-day variation later without needing entirely different assets. Establish the day scene first.

## 8. Character scale and pixel readability

The traveler should read clearly against the landscape through silhouette, backpack/gear shape, head/hair mass, and a small set of clothing color blocks. NPC design should favor strong hair shapes, simple facial clusters, profession-specific props, and distinct posture.

At the game's actual view distance, verify:
- player silhouette against bright and dark terrain;
- an NPC's facing and idle animation;
- interactable objects against their background;
- fence rails and thin vegetation do not flicker away;
- path edges are readable;
- UI text and interaction prompts remain crisp.

## 9. Region contrast

The valley is the baseline, not the entire game's palette. Future environments may be colder, more urban, overgrown, or subterranean. Maintain the same pixel scale, light logic, material clarity, and intentional color grouping so other regions still belong to the same game.

Dungeon darkness should be designed with value grouping and selective warm light. Do not simply apply a dark filter to the outdoor palette.

## 10. Asset acceptance checklist

- [ ] Reads as 3D with deliberately chunky pixel clusters.
- [ ] Matches the luminous green/blue/ochre palette family.
- [ ] Silhouette reads at game camera distance.
- [ ] Material/color groups are intentional, not noisy.
- [ ] Lighting creates warm/cool separation without crushing detail.
- [ ] Pixel scale is consistent with nearby assets.
- [ ] Does not introduce unapproved visual effects or a new style.
- [ ] Tested in the actual scene, not only a beauty render.
- [ ] Owner visually accepts the result before the look is treated as approved.

## 11. Reference asset tracking

The north-star image was supplied in the design conversation. It is **not yet committed as a repository file**. Before an agent makes final art comparisons, add it as docs/art-references/valley-vista-reference.png (or a size-optimized equivalent) in a dedicated, reviewable change. Until then, this written art bible is the operative reference and the owner remains the visual acceptance authority.
