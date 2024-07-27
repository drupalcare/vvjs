<?php

namespace Drupal\vvjs\Plugin\views\style;

use Drupal\Core\Form\FormStateInterface;
use Drupal\views\Plugin\views\style\StylePluginBase;

/**
 * Style plugin to render items in a Slideshow using vanilla JavaScript.
 *
 * @ingroup views_style_plugins
 *
 * @ViewsStyle(
 *   id = "views_vanilla_js_slideshow",
 *   title = @Translation("Views Vanilla JavaScript Slideshow"),
 *   help = @Translation("Render items in a Slideshow using vanilla JavaScript."),
 *   theme = "views_view_vvjs",
 *   display_types = { "normal" }
 * )
 */
class ViewsVanillaJavascriptSlideshow extends StylePluginBase {

  /**
   * Does the style plugin use a row plugin.
   *
   * @var bool
   */
  protected $usesRowPlugin = TRUE;

  /**
   * Set default options.
   */
  protected function defineOptions() {
    $options = parent::defineOptions();
    $options['time_in_seconds'] = ['default' => 5000];
    $options['navigation'] = ['default' => 'dots'];
    $options['animation'] = ['default' => 'bottom'];
    $options['arrows'] = ['default' => TRUE];
    $options['unique_id'] = ['default' => $this->generateUniqueId()];
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    parent::buildOptionsForm($form, $form_state);

    $form['time_in_seconds'] = [
      '#type' => 'select',
      '#title' => $this->t('Time In Seconds'),
      '#options' => [
        '0' => $this->t('None'),
        '3000' => $this->t('3 s'),
        '4000' => $this->t('4 s'),
        '5000' => $this->t('5 s'),
        '6000' => $this->t('6 s'),
        '7000' => $this->t('7 s'),
        '8000' => $this->t('8 s'),
        '9000' => $this->t('9 s'),
        '10000' => $this->t('10 s'),
        '11000' => $this->t('11 s'),
        '12000' => $this->t('12 s'),
        '13000' => $this->t('13 s'),
        '14000' => $this->t('14 s'),
        '15000' => $this->t('15 s'),
      ],
      '#default_value' => $this->options['time_in_seconds'],
      '#description' => $this->t('By default, the Slideshow scrolls every 5 seconds. You can modify this interval. If set between 3-15 seconds, a play/pause button appears and the slideshow pauses on mouse hover. To stop the slideshow, set the field value to none.'),
    ];

    $form['navigation'] = [
      '#type' => 'select',
      '#title' => $this->t('Navigation Type'),
      '#options' => [
        'none' => $this->t('None'),
        'dot' => $this->t('Dots'),
        'nav' => $this->t('Numbers'),
      ],
      '#default_value' => $this->options['navigation'],
      '#description' => $this->t('Show the bottom nav as dots or numbers.'),
    ];

    $form['animation'] = [
      '#type' => 'select',
      '#title' => $this->t('Animation Type'),
      '#options' => [
        'none' => $this->t('None'),
        'vvjs__animate_top' => $this->t('Top'),
        'vvjs__animate_bottom' => $this->t('Bottom'),
        'vvjs__animate_left' => $this->t('Left'),
        'vvjs__animate_right' => $this->t('Right'),
        'vvjs__animate_zoom' => $this->t('Zoom'),
        'vvjs__animate_opacity' => $this->t('Opacity'),
      ],
      '#default_value' => $this->options['animation'],
      '#description' => $this->t('Choose the animation type.'),
    ];

    $form['arrows'] = [
      '#type' => 'select',
      '#title' => $this->t('Top Arrows'),
      '#options' => [
        'On' => $this->t('On'),
        'Off' => $this->t('Off'),
      ],
      '#default_value' => $this->options['arrows'],
      '#description' => $this->t('Display the top left/right arrows.'),
    ];

  }

  /**
   * Generates a unique numeric ID for the view display.
   */
  protected function generateUniqueId() {
    // 8 digit unique ID
    return random_int(10000000, 99999999);
  }

  /**
   * {@inheritdoc}
   */
  public function render() {
    $rows = [];
    foreach ($this->view->result as $row) {
      $rows[] = [
        'content' => $this->view->rowPlugin->render($row),
      ];
    }

    return [
      '#theme' => $this->themeFunctions(),
      '#view' => $this->view,
      '#options' => $this->options,
      '#rows' => $rows,
      '#unique_id' => $this->options['unique_id'],
    ];
  }

}
