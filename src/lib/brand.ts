/**
 * Single source of truth for the brand palette.
 *
 * Use these JS constants in inline `style` objects AND in SVG `stroke`/`fill`
 * attributes — CSS `var()` cannot be used in SVG presentation attributes, so a
 * plain hex string sourced from here is the only form that works in both.
 * The matching CSS custom properties live in globals.css for class-based usage.
 *
 * The three reds are intentionally distinct, not duplicates:
 *  - `red`     primary UI/brand red (buttons, links, scribble underlines)
 *  - `logoRed` the logo "J" stroke — brighter on purpose
 *  - `oxblood` the route-transition wash — deeper/matte on purpose
 */
export const BRAND = {
  red: "#c0392b",
  logoRed: "#EF2626",
  oxblood: "#79291f",
  accent: "#c4a882",
  ink: "#0a0a0a",
  cream: "#e8ddd0",
  paper: "#ede7d8",
} as const;
