# Design QA — hero-only reference implementation

- Source visual truth: `C:\Users\OCTALE~1\AppData\Local\Temp\codex-clipboard-b84faf17-c1c5-4b80-bafe-f9deb2f37fac.png`
- Implementation screenshot: `C:\Users\octaleads\Documents\Codex\2026-08-27\op\work-implementation.png`
- Viewport: 1452 × 787 CSS px, desktop, default browser density.
- State: existing homepage with **New Tractor** selected in the reference finder.

## Full-view comparison

Only the homepage hero is matched to the supplied reference: a full-width blue farm banner, left tractor-finder surface, centred campaign hierarchy, and right-side tyre focal point. The established site header, catalogue, and all other homepage sections remain unchanged by request.

## Focused comparison

The finder panel and hero were inspected at the matched viewport. The existing RJ Tractor Techs identity is retained. The generated banner preserves the reference's field, blue, tyre, and tractor composition without copying the commercial creative asset.

## Fidelity surfaces

- **Fonts and typography:** Arial/Helvetica matches the compact, utility-led sans-serif treatment. Headings, navigation, selectors, and button labels use the reference's dense hierarchy.
- **Spacing and layout rhythm:** Header rows, finder panel width, hero height, catalogue start, five-card grid, and compact gaps align with the reference.
- **Colors and visual tokens:** White header and surfaces, dark blue controls, blue campaign banner, red finder badge, and muted borders follow the source's visual balance.
- **Image quality and asset fidelity:** The hero uses a generated high-resolution farm and tyre asset in the same composition. Card imagery is responsive and crops to the source's wide-card format.
- **Copy and content:** Finder labels, catalogue tabs, and tractor-related calls to action are coherent with the source interaction model. The RJ brand substitution is intentional.

## Interaction checks

- Global tractor search routes to the catalogue.
- Finder select controls route to the catalogue with the selected search terms.
- New/Used and Popular/Latest/Upcoming tabs expose selected states.
- Tractor cards route to their searched tractor result.
- No horizontal overflow at the matched desktop viewport.

## Comparison history

1. The initial implementation lacked its loaded banner asset. The asset was corrected and the browser-rendered screenshot was recaptured.
2. The banner campaign hierarchy was then added, bringing the hero's visual density in line with the source.

final result: passed
