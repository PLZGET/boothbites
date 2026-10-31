# Asset sources

All food photographs are illustrative demo-menu imagery. They do not represent a participating merchant's actual product, recipe, portion size, or allergen content. Display a short demo-photo notice with the menu.

## Food photography

| Local asset | Credit | License | Source |
| --- | --- | --- | --- |
| `/images/tteokbokki.jpg` | Popo le Chien | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Tteokbokki.JPG — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Tteokbokki.JPG) |
| `/images/hotteok.jpg` | Sandra Vallaure | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | [Hotteok 2.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Hotteok_2.jpg) |
| `/images/chicken.jpg` | Dr 방원장 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [Dak-gangjeong 2.jpg — Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Dak-gangjeong_2.jpg) |

Retrieved 2026-10-31. All three images were visually inspected and match the named dishes. The supplied files are 960px Wikimedia thumbnails, with no local retouching or crop. Wikimedia currently rejects arbitrary 800px thumbnails, so its supported 960px width is retained; each JPEG is below 160 KB. CSS display cropping, if used, should remain noted in credits.

The CC BY images require attribution, a link to the license, and an indication of changes. Include the credits in an accessible in-app credits page/footer, not solely in source code. Machine-readable metadata is available at `/images/sources.json`.

## Font

- Local file: `/fonts/manrope.woff2`
- Family: Manrope, Latin variable WOFF2, weight range 400–800.
- Official CSS source: https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&display=swap
- Binary source: https://fonts.gstatic.com/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2
- License: SIL Open Font License 1.1; full text retained at `/fonts/OFL-Manrope.txt`.
- License source: https://raw.githubusercontent.com/google/fonts/main/ofl/manrope/OFL.txt
- Operational screens retain the application's Korean fallback. Landing C uses two local Korean subsets; see [landing-font-source.md](landing-font-source.md).

## Landing C generated illustrations

Native image_gen/nativegen8 generated these eight WebP assets on 2026-10-31 for the approved C screenprint direction. They are illustrative demo imagery, not real merchant photographs or evidence of recipes/portions. The approved comp is not cropped into shipping UI; text and controls are semantic HTML.

| Asset under `/images/print/` | Dimensions | Use |
| --- | --- | --- |
| `festival.webp` | 1834×858 | Vendor-to-traveler handoff hero |
| `vendor-art.webp` | 1536×1024 | Vendor cooking scene |
| `flow-menu.webp` | 360×360 | Menu publication |
| `flow-qr.webp` | 360×360 | QR ordering |
| `flow-cook.webp` | 360×360 | Cooking |
| `flow-pickup.webp` | 360×360 | Pickup |
| `food.webp` | 640×640 | Tteokbokki menu sample |
| `paper.webp` | 512×512 | Repeating paper texture |

Each WebP has an adjacent `<filename>.json` containing its exact generation/edit prompt and creation time. PNG originals with provenance are at repository-root `assets/plates/`, with prompt files in `assets/plates/prompts/`. Final vendor artwork uses exact-alpha WebP encoding with alpha quality 100; seven exterior alpha samples are zero. Hidden RGB under transparent pixels is not evidence of a visible fringe.

The landing also uses `/images/hotteok.jpg` and preserves Sandra Vallaure / CC BY 2.0 attribution in the shared credits UI. The demo-photo notice remains. Generated asset provenance passed 8/8; actual browser compositing, crop and visual fidelity remain unverified.
