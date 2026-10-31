<?php

declare(strict_types=1);

namespace Drupal\Tests\vvjs\FunctionalJavascript;

use Drupal\Tests\vvj_core\FunctionalJavascript\VvjPatternJavascriptTestBase;
use Drupal\views\Entity\View;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;

/**
 * Browser smoke tests for the vvjs example view custom element.
 */
#[Group('vvjs')]
#[Group('vvj_javascript')]
#[RunTestsInSeparateProcesses]
final class VvjsJavascriptSmokeTest extends VvjPatternJavascriptTestBase {

  /**
   * {@inheritdoc}
   *
   * @var list<string>
   */
  protected static $modules = [
    'node',
    'block',
    'views',
    'field',
    'file',
    'filter',
    'text',
    'vvj_core',
    'vvjs',
  ];

  /**
   * {@inheritdoc}
   */
  protected function vvjExampleViewId(): string {
    return 'vvjs_example';
  }

  /**
   * {@inheritdoc}
   */
  protected function vvjCustomElementTag(): string {
    return 'vvjs-slideshow';
  }

  /**
   * The isPaused() pause-state query is exposed on the element + shim.
   *
   * Guards the capability v1 exposed via `getInstance(el).getState().isPaused`
   * and that the v2 single-class consolidation had otherwise dropped. See
   * docs/planning/VVJ-V2-DROPPED-APIS.md. This checks the API surface (not
   * hydration timing), so it is stable.
   */
  public function testIsPausedApiIsExposed(): void {
    $this->drupalGet('<front>');
    // NOT statusCodeEquals(). A WebDriver test drives a real browser through
    // DrupalSelenium2Driver, which cannot report an HTTP status code — it
    // throws UnsupportedDriverActionException. Checking for the error page is
    // the equivalent that works here.
    $this->assertSession()->pageTextNotContains(
      'The website encountered an unexpected error',
    );

    // The custom element exposes isPaused().
    $this->assertJsCondition(
      "typeof customElements.get('vvjs-slideshow').prototype.isPaused"
      . " === 'function'",
    );

    // The Drupal.vvjs compat shim exposes isPaused() and returns a boolean
    // for a rendered slideshow.
    $this->assertJsCondition(
      "typeof Drupal.vvjs.isPaused(document.querySelector('vvjs-slideshow'))"
      . " === 'boolean'",
    );
  }

  /**
   * Without looping, the arrow at an end stays in place but is disabled.
   *
   * Before this the arrows at the ends looked active and did nothing. Now the
   * arrow keeps focus, a click on it does nothing, and it carries
   * `aria-disabled="true"` plus `vvjs-disabled`.
   */
  public function testArrowsDisabledAtTheEndsWithoutLooping(): void {
    $this->setExampleStyleOptions(['enable_looping' => FALSE]);
    $this->drupalGet('<front>');
    $this->assertJsCondition("document.querySelector('vvjs-slideshow')._isHydrated === true", 10000);
    $page = $this->getSession()->getPage();

    $this->assertArrowDisabled('.prev-arrow', TRUE);
    $this->assertArrowDisabled('.next-arrow', FALSE);
    $page->find('css', 'vvjs-slideshow .prev-arrow')->click();
    $this->assertJsCondition("document.querySelector('vvjs-slideshow')._slideIndex === 1");

    // Three slides: two steps reach the end.
    $next = $page->find('css', 'vvjs-slideshow .next-arrow');
    $next->click();
    $next->click();
    $this->assertJsCondition("document.querySelector('vvjs-slideshow')._slideIndex === 3");
    $this->assertArrowDisabled('.next-arrow', TRUE);
    $this->assertArrowDisabled('.prev-arrow', FALSE);
    $this->assertJsCondition("document.activeElement === document.querySelector('vvjs-slideshow .next-arrow')");
    $next->click();
    $this->assertJsCondition("document.querySelector('vvjs-slideshow')._slideIndex === 3");
  }

  /**
   * A looping slideshow never disables either arrow.
   */
  public function testLoopingNeverDisablesArrows(): void {
    $this->setExampleStyleOptions(['enable_looping' => TRUE]);
    $this->drupalGet('<front>');
    $this->assertJsCondition("document.querySelector('vvjs-slideshow')._isHydrated === true", 10000);
    $this->assertArrowDisabled('.prev-arrow', FALSE);
    $this->getSession()->getPage()->find('css', 'vvjs-slideshow .prev-arrow')->click();
    $this->assertJsCondition("document.querySelector('vvjs-slideshow')._slideIndex === 3");
    $this->assertArrowDisabled('.prev-arrow', FALSE);
    $this->assertArrowDisabled('.next-arrow', FALSE);
  }

  /**
   * Turns autoplay off and keeps the arrows, plus the overrides.
   *
   * @param array<string, mixed> $overrides
   *   Style options to set on the example view's default display.
   */
  private function setExampleStyleOptions(array $overrides): void {
    $view = View::load('vvjs_example');
    $this->assertNotNull($view);
    $default = &$view->getDisplay('default');
    $display_options = $default['display_options'];
    $this->assertIsArray($display_options);
    $style = $display_options['style'];
    $this->assertIsArray($style);
    $options = $style['options'] ?? [];
    $this->assertIsArray($options);
    $options = $overrides + ['time_in_seconds' => '0'] + $options;
    if (($options['arrows'] ?? 'none') === 'none') {
      $options['arrows'] = 'arrows-top';
    }
    $style['options'] = $options;
    $display_options['style'] = $style;
    $default['display_options'] = $display_options;
    $view->save();
  }

  /**
   * Asserts an arrow's disabled state, by class and by aria-disabled.
   *
   * @param string $selector
   *   The arrow selector inside the slideshow.
   * @param bool $disabled
   *   The expected state.
   */
  private function assertArrowDisabled(string $selector, bool $disabled): void {
    $element = "document.querySelector('vvjs-slideshow " . $selector . "')";
    $this->assertJsCondition($disabled
      ? $element . ".getAttribute('aria-disabled') === 'true' && " . $element . ".classList.contains('vvjs-disabled')"
      : "!" . $element . ".hasAttribute('aria-disabled') && !" . $element . ".classList.contains('vvjs-disabled')");
  }

}
