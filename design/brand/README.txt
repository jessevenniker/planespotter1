Dutchplanes favicon + logo pack — toestelsilhouet
==================================================

FAVICON (Next.js app router — drop straight into /app):
  app/icon.svg          <- favicon.svg, rename to icon.svg
  app/apple-icon.png    <- apple-touch-icon.png, rename to apple-icon.png
  app/favicon.ico       <- favicon.ico

Next.js picks these up automatically from filename, no <head> tags needed.

CLASSIC <head> TAGS (if not using the app-router convention above):
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

PWA / manifest icons:
  icon-192.png, icon-512.png + site.webmanifest (included, edit name/colors
  if needed — already set to the site palette).

LOGO FILES (for header, footer, social preview — not favicons):
  dutchplanes-logo.svg            ink mark + wordmark, transparent bg,
                                   for the normal paper background
  dutchplanes-logo-reversed.svg   paper-coloured version for dark sections
  icon-mark.svg                   mark on its own, transparent, ink fill —
                                   recolour by editing the fill or wrapping
                                   in something that sets currentColor

The wordmark is set in Archivo (already loaded on the site). If Archivo
isn't loaded wherever you drop this SVG, it'll fall back to the browser's
default bold sans — still readable, just not condensed.

Colours used: ink #16202A, plate #F2C12E (favicon background), paper #E9EAE5.
