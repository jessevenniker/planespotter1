---
name: planespotternederland-design
description: The design system for planespotternederland (Dutchplanes), a Dutch aviation photography site selling prints and digital downloads. Use this skill whenever building, editing, restyling, or extending any page, component, or email template for planespotternederland, Dutchplanes, or the planespotter print shop, including when the user only says "the spotter site", "my brother's site", or names a page like the shop, the log, or a photo page. Also use it when reviewing that site's code or deciding on copy, colors, type, or layout for it. Do not produce generic webshop or portfolio styling for this project; always read this skill first.
---

# planespotternederland: design system

## The idea in one line

The site is a **logbook**, not a gallery and not a webshop. Every photo is an
entry in a flight log with real metadata. The commerce sits inside the log
rather than the log being decoration for a store.

This matters because it is what makes the site defensible. Anyone can put
aviation photos in a grid. Almost nobody has the registrations, runways,
operators, and dates that a real spotter records. Lean on the data.

## Why not the obvious alternatives

Rejected on purpose, do not drift back toward these:

- A masonry photo grid with a lightbox. Generic, and it hides the data.
- Rounded cards with soft grey shadows. Reads as SaaS template.
- Cream background plus high-contrast serif plus terracotta accent. The current
  house style of generated pages.
- Near-black plus one acid accent. Same problem, other direction.
- A "Shop" tab bolted onto a portfolio. The shop is not a separate world.

## Color

Grounded in two real references: Jeppesen approach-chart ink on chart stock,
and the Dutch registration plate (PH- registrations, yellow plate, black type).

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#16202A` | Body text, headings, rules at full strength |
| `--paper` | `#E9EAE5` | Page background, cool grey-green chart stock |
| `--paper-2` | `#DFE1DB` | Alternating log rows, inset panels |
| `--plate` | `#F2C12E` | Registration marks, active row, sold-out and in-cart states |
| `--rule` | `#B5B8B0` | Hairlines, table borders, field underlines |
| `--approach` | `#3E6B87` | Links, focus rings, the one cool accent |

Dark mode is optional and not the default. If added, invert to `--ink` ground
with `--paper` type, keep `--plate` unchanged, and lighten `--rule` to `#3A444C`.

Photos are the only saturated color on the page. Everything else stays quiet.
Never put a gradient behind a photo, and never tint a photo to match the palette.

## Type

Two families, clearly distinct in role. Both on Google Fonts.

- **Archivo** (variable). All prose, headings, buttons, navigation. Use the
  condensed widths (roll `wdth` down to about 85) for headings so they read like
  airport signage. Weights: 400 body, 600 headings.
- **Departure Mono** (or JetBrains Mono as fallback). Only for logged data:
  registrations, ICAO and IATA codes, runway designators, dates, dimensions,
  prices, order numbers. If a value was recorded rather than written, it is
  mono.

That rule is the whole typographic system. Mono means data. Do not use mono for
labels, captions, eyebrows, or decoration, and do not set prose in it.

Scale, in rem: 0.75 / 0.875 / 1 / 1.25 / 1.625 / 2.5 / 4. Body line-height 1.55,
headings 1.1. Tabular numerals on everything mono (`font-variant-numeric:
tabular-nums`) so columns line up.

No all-caps labels. No single accented word in a headline. No eyebrow text above
headings.

## Layout

Left-aligned throughout. One content column of 1240px max, with the log table
allowed to run full width on desktop.

The grid is a real table on the log pages, not divs pretending to be one. It
should be readable as a table by a screen reader and sortable by column.

```
┌──────────────────────────────────────────────────────────────┐
│ DUTCHPLANES                              log  shop  about    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────┐   PH-EXZ                     │
│  │                            │   Embraer E190-E2            │
│  │      latest entry photo    │   KLM Cityhopper             │
│  │                            │   18R Polderbaan             │
│  │                            │   2026-03-14  16:42          │
│  └────────────────────────────┘   print from €35             │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ DATE        REG      TYPE            OPERATOR      RWY   ▸    │
│ 2026-03-14  PH-EXZ   E190-E2         KLM Cityh..   18R   [▪] │
│ 2026-03-09  N904AT   747-8F          Atlas Air     18C   [▪] │
│ 2026-02-27  F-GXTD   A330-743L       Airbus        06    [▪] │
└──────────────────────────────────────────────────────────────┘
```

Hovering or focusing a log row swaps the hero photo above it. That is the one
piece of motion on the page and the thing people will remember. Everything else
stays still. Respect `prefers-reduced-motion` by disabling the crossfade and
swapping instantly.

Photo pages keep the same metadata block, with the buy options appended to it as
further rows. A print size is just another logged value.

## Commerce inside the log

- Print sizes are listed with real dimensions in mono: `30 × 40 cm`, not "Medium".
- Prices in mono, euro symbol first, no decimals when whole: `€35`.
- Digital downloads are listed with pixel dimensions and file size, because that
  is what the buyer is actually paying for.
- The cart is a "manifest". Keep that word consistently: the button says
  "Add to manifest", the page is the manifest, the confirmation says "Added".
- Never write "Shop now", "Discover", "Explore our collection", or "Elevate your
  space".

## Copy

Dutch first, English available. Both plain and flat. The voice is a spotter
writing down what he saw, not a brand.

Good: "Gespot vanaf de Polderbaan, 14 maart, kort na zonsopkomst."
Bad: "Ervaar de schoonheid van de luchtvaart."

Empty states say what to do: "Nog geen entries voor deze baan. Bekijk 18R."
Errors say what happened and what fixes it, without apologising.

## Quality floor

Responsive to 360px wide. The log table collapses to stacked entries on mobile,
keeping the mono metadata. Visible focus rings in `--approach`, never removed.
Alt text on every photo built from the metadata: type, operator, registration,
location. Images served as AVIF with JPEG fallback, lazy below the fold, with
explicit width and height so nothing shifts.

Watermarking: preview images carry a small `--plate` registration mark bottom
right. Purchased downloads never do.

## Before you ship a page

Ask these four, and fix anything that fails:

1. Could this page be for any photographer, if the photos were swapped out? If
   yes, the data is not doing enough work.
2. Is there more than one moving thing? Cut back to one.
3. Is any mono text not a recorded value? Change it to Archivo.
4. Does any copy sell rather than describe? Rewrite it.
