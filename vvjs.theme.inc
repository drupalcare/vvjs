<?php

/**
 * @file
 * Theming for Views Vanilla Javascript Slideshow.
 */

/**
 * Implements template_preprocess_views_view_vvjs().
 */
function template_preprocess_views_vvjs(&$variables) {
  // View options set by the user.
  $options = $variables['view']->style_plugin->options;

  // Pass the options to the template.
  $variables['options'] = $options;

  // Attach any required libraries or settings.
  $variables['#attached']['drupalSettings']['vvjs'] = $options;
}
