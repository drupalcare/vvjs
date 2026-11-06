# Changelog

## [2.0.0] (UNRELEASED)

- Patterns: the bridge reads the shared `--vvj-theme-*` roles instead of spelling theme names.
- Patterns: under Solo or APEX the Pattern controls take the theme's button and menu colors; black and white stays the default on any other theme.
- Accessibility: slideshow keys work only when focus is inside the slideshow (Space, Home, End and arrows stay with the page), keyboard focus holds autoplay, autoplay steps are no longer announced, JS strings are translatable, the progress bar is no longer a live region, and the hero slide drops its `complementary` and `img` roles.
- Patterns: text over photos sits on a darker panel or band (Iris, Nightfall, Filmstrip default), Deck story bars are at least 24px wide and wrap, and the Nightfall tick row wraps instead of overflowing at 320px.
- Pattern Nightfall: the title keeps clear of the previous and next arrows at every width, and its size follows the Pattern's width instead of the window's.
- Patterns: the viewport breakpoint files (`vvjs-NNN.css`, `vvjs-hero-NNN.css`) no longer lay out Pattern markup, so a Pattern's own container layout is the only one that applies (hero card readable on phones, Deck tap zones kept on small screens); classic slideshows are unchanged.

**Drop-in upgrade for 1.x sites.** v2 modernizes internals: extends `vvj_core`
foundation, ships `<vvjs-slideshow>` custom element extending `VvjElementBase`,
AbortController-tracked listeners, IntersectionObserver-driven pause-when-out-
of-viewport, full Pointer Events API for swipe, while preserving every CSS
rule, library name (incl. all 5 + 5 breakpoint variants and
admin/opacity/hero/transitions companions), option key, plugin ID, theme hook,
JS behavior key, and the full Drupal.vvjs.* public API surface from 1.x.

### Added

- Patterns: 5 ready-made designs (Iris, Deck, Filmstrip, Ledger, Nightfall) chosen in the format settings. They need the `vvj_patterns` sub-module of `drupal/vvj_core`.
- `drupal/vvj_core` dependency (auto-installed).
- `vvjs.install` with `vvjs_update_10001()` to auto-enable vvj_core during
  `drush updb`.
- `<vvjs-slideshow>` custom element. Lazy IntersectionObserver hydration;
  AbortController-tracked listeners; consolidated single class replacing v1's
  seven-module file split.

### Changed

- Plugin extends `VvjStylePluginBase`. Implements four small subclass hooks;
  standard sections come from the base. 7 form sections (Hero, Responsive,
  Timing, Navigation, Animation, Display, Behavior). Same controls as v1.
- `getDeeplinkReservedWords()` overridden to include vvjs's
  `slideshow`/`slide`/`vvjs`/`vvj` slugs.
- Token resolution delegates to `vvj_core.token_resolver`.
- Hooks moved to OOP `#[Hook]` classes.
- Seven JS modules consolidated into one custom-element class, same behavior,
  single load, no inter-module event-bus indirection. Cross-module communication
  that v1 did via
  `vvjs:slideChanging`/`vvjs:slideChanged`/`vvjs:transitionComplete` etc.
  CustomEvents is now method calls on `this`.
- `Drupal.vvjs.{getInstance,getAllInstances,goToSlide,getCurrentSlide,getTotalSlides,nextSlide,prevSlide,pause,resume,isPaused,pauseAll,resumeAll}`
  now delegate to methods on the custom element instance.
- `getInstance()` returns the `<vvjs-slideshow>` element itself (v1 returned a
  `Slideshow` orchestrator object).
- Code style: JavaScript and CSS follow Drupal core's ESLint, Stylelint and Prettier rules, and the spell-check job passes with a project word file. Rendering and behavior are unchanged.
- Layout: Pattern layout now follows the width the Pattern itself gets (container queries on `vvj-region`) instead of the screen width, so Patterns lay out correctly in a narrow content column; overlays and the Pattern root keep screen-width queries.

### Fixed

- Hover rules that must beat a rest rule are flattened with `:where()` so no new Pattern selector exceeds 0,2,0; the look is unchanged (check-vvj-cascade: winners changed 0).
- Patterns: Iris text clears the slide numbers and its numbers stay in one row inside the stage; Deck text keeps room for the play button and counter; Filmstrip numbers line up with the play button and scroll instead of squeezing the active one.
- **The arrows show when there is nothing further.** On a slideshow that does
  not loop, the previous arrow on the first slide and the next arrow on the
  last looked active but did nothing. They now stay in place, dimmed and
  marked `aria-disabled="true"`, with the new `vvjs-disabled` class. Keyboard
  focus stays on an arrow that becomes disabled. Looping slideshows are
  unchanged.
- Update 10002 converts v1 views to the v2 option shape (value types:
  strings and integers stored where v2 declares integer, boolean and float).
- Regular (non-hero) slideshows again work with **any** row plugin (e.g. an
  `entity:node` teaser), matching v1. The shared base was requiring, and force-
  switching the view to. The Fields row style in every mode; it now only does
  so in hero mode. Fixes the false "vvjs requires Fields as row style" error on
  the shipped `vvjs_example` view, and stops the view editor from overwriting a
  non-Fields row.
- Hero layout fields (max width/height, overlay position/color/opacity) are now
  hidden via `#states` unless **Enable Hero Slideshow Mode** is checked.
- Restored conditional field visibility (`#states`) the v2 port had dropped:
  Transition Type/Duration show only when Animation is "None" (Duration
  also requires a crossfade); Scrollable Dots Width shows only for
  Dots/Numbers nav; Progress Bar, Play/Pause, and Pause-on-Hover disable when
  auto-advance timing is 0.
- Restored the "Transition Types Explained" help block (with the reduced-
  motion/GPU note).
- Restored server-side validation: Progress Bar / Play-Pause are rejected when
  auto-advance timing is 0; Scrollable Dots Width must be 0 or within [MIN,
  MAX].
- Restored the flatten reset that forces Transition Type back to Instant when a
  slide animation is active, so a crossfade `data-transition` (and the `vvjs-
  transitions` library) is no longer emitted alongside an animation, matching
  v1.
- Animation dropdown order back to v1 (None, **Zoom, Fade**, …).
- The slideshow measures a slide without changing its opacity or stacking, and the opacity control releases its listener on detach. A `line-height` that a later `font: inherit` always overrode is removed from the dots/arrows rule; it never applied.
- In numbers mode inside a pattern, the number buttons use the module's own size (0.875rem) and line-height (1), which the pattern base had reset to the inherited font. The Deck, Filmstrip, Iris, Ledger and Nightfall patterns keep their own number styling.

### Removed

The seven-module → single-class consolidation dropped v1's orchestrator-only
surfaces. Full migration record + replacements: [docs/planning/VVJ-V2-DROPPED-
APIS.md](../../../docs/planning/VVJ-V2-DROPPED-APIS.md).

- Instance methods `getModule()`, `getAllModules()`, `getState()`,
  `reinitialize()`, `isInitialized()`, `destroy()`, `updateConfig()`. No
  modules exist; use the element's direct methods, the automatic
  hydration/disconnect lifecycle, and re-render the View to change config.
- `vvjs:*` CustomEvents on the container (internal inter-module signals). The
  element emits `vvj:ready` on `document` via `VvjElementBase` instead.
- **Restored**: `isPaused()` and `isInitialized()` on the element +
  `Drupal.vvjs.isPaused()` / `Drupal.vvjs.isInitialized()`: the pause-state and
  init-state queries v1 exposed via `getState().isPaused` /
  `getInstance(el).isInitialized()`. Plus a `vvj:slideChanged` CustomEvent on
  `document` (detail: `slide`, `previousSlide`, `total`) restoring v1's per-
  slide observability.

### Drupal core / PHP

- Requires Drupal `^11.3 || ^12`, PHP `>=8.3`.
