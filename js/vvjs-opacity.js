/**
 * @file
 * Views Vanilla JavaScript Slideshow - Opacity Toggle.
 *
 * Filename:     opacity.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 *
 */

// phpcs:disable Drupal.NamingConventions.UpperCaseConstant
// phpcs:disable Generic.PHP.UpperCaseConstant
// phpcs:disable Squiz.WhiteSpace.OperatorSpacing

(function (Drupal, drupalSettings, once) {
  /**
   * One AbortController per wired checkbox, aborted when it is unloaded.
   *
   * @type {WeakMap<HTMLInputElement, AbortController>}
   */
  const controllers = new WeakMap();

  /**
   * Toggle opacity controls based on hero slideshow state.
   *
   * @type {Drupal~behavior}
   * @prop {Drupal~behaviorAttach} attach
   *   Attaches the opacity toggle behavior to hero slideshow checkbox.
   */
  Drupal.behaviors.vvjsToggleOpacity = {
    attach(context, settings) {
      // Early validation - check if required settings exist
      if (!drupalSettings || !drupalSettings.vvjs) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(
            'VVJS: drupalSettings.vvjs not found. Opacity toggle disabled.',
          );
        }
        return;
      }

      const vvjsSettings = drupalSettings.vvjs;

      // Validate required selectors
      if (
        !vvjsSettings.heroSlideshowSelector ||
        !vvjsSettings.opacityValueSelector
      ) {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn(
            'VVJS: Required selectors missing in drupalSettings.vvjs',
          );
        }
        return;
      }

      // Cache DOM elements with context support for Ajax
      const heroSlideshowCheckbox = context.querySelector(
        vvjsSettings.heroSlideshowSelector,
      );
      const opacityValueContainer = context.querySelector(
        vvjsSettings.opacityValueSelector,
      );

      // Exit early if elements don't exist
      if (!heroSlideshowCheckbox || !opacityValueContainer) {
        return; // Silent fail - elements might not be on this page
      }

      // once() keeps Ajax re-attaches from adding a second listener.
      if (!once('vvjs-opacity', heroSlideshowCheckbox).length) {
        return;
      }

      /**
       * Updates opacity control visibility and accessibility.
       *
       * @param {boolean} isHeroMode - Whether hero slideshow is enabled
       */
      const updateOpacityVisibility = (isHeroMode) => {
        if (isHeroMode) {
          opacityValueContainer.classList.remove('hidden-element');
          opacityValueContainer.removeAttribute('aria-hidden');

          // Focus management for better UX
          const opacityInput =
            opacityValueContainer.querySelector('input, select');
          if (opacityInput) {
            opacityInput.removeAttribute('tabindex');
          }
        } else {
          opacityValueContainer.classList.add('hidden-element');
          opacityValueContainer.setAttribute('aria-hidden', 'true');

          // Remove from tab order when hidden
          const opacityInput =
            opacityValueContainer.querySelector('input, select');
          if (opacityInput) {
            opacityInput.setAttribute('tabindex', '-1');
          }
        }

        // Trigger custom event for other scripts to listen to
        const event = new CustomEvent('vvjs:opacityToggle', {
          detail: {
            isHeroMode,
            container: opacityValueContainer,
          },
          bubbles: true,
        });
        heroSlideshowCheckbox.dispatchEvent(event);
      };

      /**
       * Handle checkbox change with improved error handling.
       *
       * @param {Event} event - The change event
       */
      const handleCheckboxChange = (event) => {
        try {
          const isChecked = event.target.checked;
          updateOpacityVisibility(isChecked);
        } catch (error) {
          if (typeof console !== 'undefined' && console.error) {
            console.error('VVJS: Error in opacity toggle handler:', error);
          }
        }
      };

      // Set initial state based on checkbox value
      updateOpacityVisibility(heroSlideshowCheckbox.checked);

      // Add event listener with passive option for better performance
      const controller = new AbortController();
      controllers.set(heroSlideshowCheckbox, controller);
      heroSlideshowCheckbox.addEventListener('change', handleCheckboxChange, {
        passive: true,
        signal: controller.signal,
      });

      // Optional: Add visual feedback during transitions
      if (opacityValueContainer.style.transition === '') {
        opacityValueContainer.style.transition = 'opacity 0.3s ease-in-out';
      }
    },

    /**
     * Clean up when behavior is detached (important for Ajax contexts).
     *
     * @param {HTMLDocument|HTMLElement} context
     *   The context for which the behavior is being detached.
     * @param {object} settings
     *   An object containing settings for the current context.
     * @param {string} trigger
     *   One of 'unload', 'move', or 'serialize'.
     */
    detach(context, settings, trigger) {
      if (trigger === 'unload') {
        // Release the once() marker and the change listener, so a later
        // attach wires it again exactly once.
        once
          .remove('vvjs-opacity', '[data-once~="vvjs-opacity"]', context)
          .forEach((checkbox) => {
            controllers.get(checkbox)?.abort();
            controllers.delete(checkbox);
          });
      }
    },
  };
})(Drupal, drupalSettings, once);
