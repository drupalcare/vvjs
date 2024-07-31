<?php

/**
 * @file
 * Contains the hook implementations for the custom Views style plugin.
 */

/**
 * Implements hook_views_data_alter().
 */
function vvjs_views_data_alter(array &$data) {
  // Define the style plugin schema.
  $data['views_style_plugin']['views_vvjs'] = [
    'type' => 'views_style',
    'label' => t('Views Vanilla JavaScript Slideshow'),
    'mapping' => [
      'time_in_seconds' => [
        'type' => 'integer',
        'label' => t('Time In Seconds'),
      ],
      'navigation' => [
        'type' => 'string',
        'label' => t('Navigation Type'),
      ],
      'animation' => [
        'type' => 'string',
        'label' => t('Animation Type'),
      ],
      'arrows' => [
        'type' => 'string',
        'label' => t('Top Arrows'),
      ],
      'unique_id' => [
        'type' => 'string',
        'label' => t('Unique ID for the view display'),
      ],
    ],
  ];
}
