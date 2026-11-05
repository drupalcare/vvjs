# Views Vanilla JavaScript Slideshow (VVJS)

A vanilla-JavaScript slideshow **Views format** for Drupal. The most
fully-featured of the VVJ pattern modules: regular and hero slideshow modes,
four transition types (instant + three crossfade variants), seven animations,
autoplay with full pause-control, arrows, dots, numbers, play/pause, progress
bar, slide counter, deep linking, swipe + keyboard + screen-reader, and AAA-conformant accessibility.

Behavior runs in a `<vvjs-slideshow>` custom element extending `VvjElementBase`, built on the **`drupal/vvj_core` foundation** (composer auto-installs it).

## Table of contents

- Overview
- Requirements
- Installation
- Configuration
- Patterns
- Usage
- Troubleshooting
- Changelog
- Maintainers
- License

## Overview

### Features

#### Modes
- **Regular slideshow**: standard slide-by-slide content rotation
- **Hero slideshow**: first field as hero background image, remaining fields as
  overlay content; 12 overlay positions; configurable rgba overlay color from
  hex+opacity

#### Transitions + animations
- 4 transition types: `instant` / `crossfade-classic` / `crossfade-staged` /
  `crossfade-dynamic`
- Configurable transition duration (200–2000 ms)
- 7 animation directions (None / Fade / Zoom / four slide directions)

#### Autoplay + controls
- Configurable interval (0 to disable; otherwise 2000–15000 ms)
- Pause on hover, pause when tab hidden, pause when scrolled out of viewport
  (IntersectionObserver), pause on `prefers-reduced-motion`
- Play/pause button with SVG swap + ARIA label sync
- RAF-quality progress bar (`role="progressbar"`, `--progress` CSS var)
- Slide counter ("X of Y")

#### Navigation
- Arrows in 4 positions (Sides / Sides Big / Top / Top Big) or none
- Bottom navigation: dots / numbers / none
- Scrollable dots/numbers variant for large slide counts
- Configurable looping toggle
- Configurable start slide index

#### Accessibility
- Pointer Events API with Touch fallback for swipe (RTL-aware)
- Keyboard nav: ArrowLeft/Right, Space (play/pause), Home, End
- Screen-reader announcer via ARIA live region
- ARIA `role="tabpanel"` / `inert` / `aria-hidden` per slide
- `aria-selected` on dots/numbers, focus management on slide change

#### Architecture
- 5 responsive breakpoints (576 / 768 / 992 / 1200 / 1400 px), separate hero
  overrides per breakpoint
- Deep linking via URL hash (`#identifier-{n}`)
- Lazy IntersectionObserver hydration; AbortController-tracked listeners
- **Views tokens**: `[vvjs:field]` / `[vvjs:field:plain]` in Views text areas
  with *Use replacement tokens from the first row*
- **Drupal admin help**: `/admin/help/vvjs`

## Requirements

- Drupal core `^11.3 || ^12`
- PHP 8.3 or later
- Drupal core modules Views (`drupal:views`) and Filter (`drupal:filter`)
- [VVJ Core](https://www.drupal.org/project/vvj_core) (`drupal/vvj_core` `^2.0.1`), which composer installs for you

Optional: the `vvj_patterns` sub-module of `drupal/vvj_core` adds the Pattern select to the format settings (see [Patterns](#patterns)), and `vvj_patterns_demo` adds example content.

## Installation

```bash
composer require drupal/vvjs:^2.0
drush en vvjs
```

### Upgrading from 1.x

`composer update drupal/vvjs && drush updb && drush cr` is sufficient. v2
preserves:

- Plugin ID `views_vvjs`, theme hook `views_view_vvjs`
- Twig template names
- All 28 option keys
- Library names (`vvjs`, `vvjs-style`, `vvjs-hero`, `vvjs-transitions`, `vvjs-opacity`, `vvjs-admin`, plus 5 + 5 breakpoint variants)
- JS behavior key `Drupal.behaviors.VVJSlideshow`
- Public API surface `Drupal.vvjs.{getInstance, getAllInstances, goToSlide,
  getCurrentSlide, getTotalSlides, nextSlide, prevSlide, pause, resume,
  pauseAll, resumeAll, isPaused, isInitialized}`
- All CSS class names (`.vvjs`, `.vvjs-inner`, `.vvjs-items`, `.vvjs-item`,
  `.vvjs-active`, `.vvjs-previous`, `.vvjs-hero-image`, `.vvjs-hero-content`,
  `.dots-numbers-button-wrapper`, `.dots-numbers-button`, `.play-pause-button`,
  `.next-arrow`, `.prev-arrow`, `.progressbar`, `.announcer`)

Outer rendered tag changed from `<div>` to `<vvjs-slideshow>`. Theme selectors
targeting `.vvjs` keep matching.

`drush updb` enables `vvj_core` (`vvjs_update_10001`) and converts existing views to the v2 option shape (`vvjs_update_10002`). Without `vvj_core` on disk the update stops with a message telling you to download `drupal/vvj_core` and run `drush updb` again.

## Configuration

All settings live in the format settings of the *Views Vanilla JavaScript Slideshow* style on a View. They are grouped into timing, navigation, animation, transition, display and behavior sections, and a **Patterns** section when `vvj_patterns` is enabled. The extended help topic is at `/admin/help/vvjs`.

Settings are stored in the View itself, as options of the `views_vvjs` style plugin; their types are declared in `config/schema/vvjs.schema.yml`.

## Patterns

A Pattern is a ready-made design for this format. VVJS ships 5. Enable the `vvj_patterns` sub-module of `drupal/vvj_core` (`drush en vvj_patterns`), open the format settings and choose one in **Patterns** > **Pattern**.

| Pattern | Look |
|---|---|
| Iris | Full-bleed photo hero; the next photo opens as a circle from the control you press, with a floating glass dock. |
| Deck | A portrait card on two ghost cards with story bars that fill with the time left; tap either half of the card. |
| Filmstrip | A boxed photo stage with the words on a solid card and a numbered rail; the active tab widens and fills with the time left. |
| Ledger | An editorial split: numbered chapter tabs, a giant outlined numeral and the words, the photo cut in on a diagonal. Manual, no loop. |
| Nightfall | A 21:9 cinema hero on black: a curtain opens from the center, one large centered title, a timeline bar with a playhead. |

When you choose a different Pattern and save, its settings replace the layout, animation, styling and deep linking settings of the view; you can still change them afterwards. Choose **None** to keep your own settings. Drupal then shows a message naming the settings the Pattern set.

Each Pattern also lists what the view still needs, for example the fields to add, their order and the CSS classes to give them. The list appears under **To finish the Pattern** in the Patterns section and as a warning after you save. The `vvj_patterns_demo` sub-module shows a working setup: it adds the "VVJ Slide" content type (fields `vvj_nav_label`, `vvj_image`, `vvj_kicker`, `vvj_summary` and `vvj_link`, besides the title), five demo slides and, as optional config, an example view for each VVJ module named `vvj_demo_<module>`.

## Usage

1. Create or edit a View.
2. Set **Format** to *Views Vanilla JavaScript Slideshow*.
3. Set **Show** to *Fields*.
4. For hero mode, the first field is treated as the hero background; place a
   `<div class="vvjs-separator"></div>` field between background and overlay
   content.
5. Configure timing / navigation / animation / transition / display / behavior
   in the format settings.
6. Save.

**Sample view:** Optional config `views.view.vvjs_example` (`config/optional/`)
installs when there is no ID conflict.

### Tokens in Views text areas

In Views headers, footers, or empty text with *Use replacement tokens from the
first row*, default Twig tokens (`{{ title }}`) do not work. Use VVJS tokens
instead:

- `{{ title }}` → `[vvjs:title]`
- `{{ field_image }}` → `[vvjs:field_image]`
- Append `:plain` for plain text: `[vvjs:title:plain]`

v2 resolves tokens through the shared `vvj_core.token_resolver` service; syntax
is unchanged from v1. Tokens read from the **first row** of rendered View
fields. Complex field rewrites are not supported.

### Public API

External code can drive the slideshow via `Drupal.vvjs.*`. Pass either the
deeplink identifier, a CSS selector, or an `Element` reference:

```js
Drupal.vvjs.goToSlide('gallery', 3);          // jump to slide 3 (1-based)
Drupal.vvjs.nextSlide('gallery');             // advance one slide
Drupal.vvjs.prevSlide('gallery');             // back one slide
Drupal.vvjs.pause('gallery');                 // pause autoplay
Drupal.vvjs.resume('gallery');                // resume autoplay
Drupal.vvjs.isPaused('gallery');              // → boolean|null
Drupal.vvjs.isInitialized('gallery');         // → boolean|null
Drupal.vvjs.pauseAll();                       // pause every slideshow on page
Drupal.vvjs.resumeAll();                      // resume every slideshow on page
Drupal.vvjs.getCurrentSlide('gallery');       // → number (1-based)
Drupal.vvjs.getTotalSlides('gallery');        // → number
Drupal.vvjs.getInstance('#vvjs-12345');       // → <vvjs-slideshow> element
Drupal.vvjs.getAllInstances();                // → array of <vvjs-slideshow> elements
```

## Troubleshooting

- **There is no Patterns section.** The section appears only while `vvj_patterns` is enabled. Run `drush en vvj_patterns`.
- **Saving the view changed my settings.** Choosing a different Pattern replaces the layout, animation, styling and deep linking settings. Choose **None** to keep your own.
- **A Pattern looks unfinished.** Follow the list under **To finish the Pattern**: the fields, their order and the CSS classes the Pattern needs.
- **After upgrading from 1.x the view fails or `vvj_core` is not enabled.** Run `drush updb`; update `vvjs_update_10001` enables `vvj_core`. Composer installs it automatically, and a manual install needs `drupal/vvj_core` in `modules/contrib/vvj_core` first.
- **Test errors that name missing infrastructure.** See *Running the tests* in [CONTRIBUTING.md](./CONTRIBUTING.md).
- **Anything else.** Search or open an issue in the [issue queue](https://www.drupal.org/project/issues/vvjs).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Maintainers

- Alaa Haddad - [flashwebcenter](https://www.drupal.org/u/flashwebcenter)

## License

GPL-2.0-or-later.
