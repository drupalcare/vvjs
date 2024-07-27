/**
 * @file
 * Views Vanilla Javascript Slideshow.
 *
 * Filename:     vvjs.js
 * Website:      https://www.flashwebcenter.com
 * Developer:    Alaa Haddad https://www.alaahaddad.com.
 */
((Drupal, drupalSettings, once) => {
  'use strict';

  Drupal.behaviors.ViewsVJsSlideshow = {
    attach: function(context, settings) {

      const slides = once('ViewsVanillaJsSlideshow', '.vvjs__items', context);
      if (!slides.length) {
        return;
      }

      let slideIndex = 1;
      let autoSlideIntervalId = null;
      let isPaused = false;

      const manageAutoSlideInterval = (action, parentId, slideTime) => {
        if (action === 'clear') {
          if (autoSlideIntervalId) {
            clearInterval(autoSlideIntervalId);
            autoSlideIntervalId = null;
          }
        } else if (action === 'start') {
          if (!autoSlideIntervalId && slideTime > 0) { // Check if slideTime is greater than 0
            autoSlideIntervalId = setInterval(() => autoSlide(parentId, getNextItemIndex), slideTime);
          }
        }
      };

      const getNextItemIndex = (totalSlides) => {
        slideIndex = slideIndex % totalSlides + 1;
        return slideIndex;
      };

      const getPreviousItemIndex = (totalSlides) => {
        slideIndex = slideIndex === 1 ? totalSlides : slideIndex - 1;
        return slideIndex;
      };

      const getParentId = (element) => {
        return parseInt(element.split('-')[2]);
      };

      const getElementId = (element) => {
        return parseInt(element.split('-')[3]);
      };

      const getSlideIndex = (slides) => {
        for (let i = 0; i < slides.length; i++) {
          const slide = context.getElementById(slides[i].id);
          if (window.getComputedStyle(slide).display === 'block') {
            slideIndex = i + 1;
            break;
          }
        }
        return slideIndex;
      };

      const updateNavigationState = (parentId, activeSlideId) => {
        const allButtons = context.querySelectorAll(`#vvjs__itemshow-${parentId}>.vvjs__slide-nav>.vvjs__slide-bottom-btn`);
        allButtons.forEach(button => {
          const buttonId = getElementId(button.id);
          if (buttonId === activeSlideId) {
            button.classList.add('vvjs__active');
            button.removeAttribute('tabindex');
            button.setAttribute('aria-selected', 'true');
          } else {
            button.classList.remove('vvjs__active');
            button.setAttribute('tabindex', '-1');
            button.setAttribute('aria-selected', 'false');
          }
        });
      };

      const updateSlideVisibility = (parentId, activeSlideId) => {
        const slides = context.querySelectorAll(`#vvjs__items-${parentId}>.vvjs__slide-item`);
        slides.forEach((slide, index) => {
          if (index + 1 === activeSlideId) {
            slide.style.display = 'block';
            slide.setAttribute('aria-hidden', 'false');
            slide.focus();
          } else {
            slide.style.display = 'none';
            slide.setAttribute('aria-hidden', 'true');
          }
        });
      };

      const getNextSlide = (parentId, slideId) => {
        const slidesSelector = `#vvjs__items-${parentId}>.vvjs__slide-item`;
        const currentIdSelector = `#vvjs__items-${parentId}>#vvjs__slide-item-${parentId}-${slideId}`;
        const activeButtonSelector = `#vvjs__itemshow-${parentId}>.vvjs__slide-nav>#vvjs__slide-bottom-btn-${slideId}`;
        const allActiveClassesSelector = `#vvjs__itemshow-${parentId}>.vvjs__slide-nav>.vvjs__slide-bottom-btn`;

        let slides = context.querySelectorAll(slidesSelector);
        let selectedPane = context.querySelector(currentIdSelector);
        let activeButton = context.querySelector(activeButtonSelector);
        let allActiveClasses = context.querySelectorAll(allActiveClassesSelector);

        allActiveClasses.forEach(element => {
          element.classList.remove('vvjs__active');
        });

        slides.forEach(element => {
          element.style.display = 'none';
        });

        return [selectedPane, activeButton];
      };

      const handlePrevNextBtn = (element, itemFunction) => {
        const parentId = getParentId(element);
        manageAutoSlideInterval('clear');
        const slides = context.querySelectorAll(`#vvjs__items-${parentId}>.vvjs__slide-item`);
        const totalSlides = slides.length;
        const slideId = itemFunction(totalSlides);

        updateSlideVisibility(parentId, slideId);
        updateNavigationState(parentId, slideId);

        // Resume auto-slide if it was playing
        if (!isPaused) {
          let slideTime = parseInt(context.querySelector(`#vvjs__itemshow-${parentId}>.vvjs__ps-value`).textContent);
          manageAutoSlideInterval('start', parentId, slideTime);
        }
      };

      const handleBottomNav = (e, p) => {
        const slideId = getElementId(e);
        const parentId = getParentId(p);
        manageAutoSlideInterval('clear');

        const slides = context.querySelectorAll(`#vvjs__items-${parentId}>.vvjs__slide-item`);
        slides.forEach(slide => {
          if (parseInt(slide.id.split('-').pop()) === slideId) {
            slide.style.display = 'block';
            slide.setAttribute('aria-hidden', 'false');
            slide.focus();
          } else {
            slide.style.display = 'none';
            slide.setAttribute('aria-hidden', 'true');
          }
        });

        updateNavigationState(parentId, slideId);
        slideIndex = slideId;

        // Restart the auto-slide interval if the slideshow is not paused
        if (!isPaused) {
          const slideTime = parseInt(context.querySelector(`#vvjs__itemshow-${parentId}>.vvjs__ps-value`).textContent);
          manageAutoSlideInterval('start', parentId, slideTime);
        }
      };

      const autoSlide = (parentId, itemFunction) => {
        const slides = context.querySelectorAll(`#vvjs__items-${parentId}>.vvjs__slide-item`);
        getSlideIndex(slides);
        const totalSlides = slides.length;
        const slideId = itemFunction(totalSlides);

        slides.forEach(slide => {
          const currentSlideId = parseInt(slide.id.split('-').pop());
          if (currentSlideId === slideId) {
            slide.style.display = 'block';
            slide.setAttribute('aria-hidden', 'false');
          } else {
            slide.style.display = 'none';
            slide.setAttribute('aria-hidden', 'true');
          }
        });

        updateNavigationState(parentId, slideId);
      };

      once('init-slides', slides).forEach(slide => {
        let slideId = slide.id;
        let parentId = parseInt(slide.id.split('-')[1]);
        let slideTime = parseInt(context.querySelector(`#vvjs__itemshow-${parentId}>.vvjs__ps-value`).textContent);

        manageAutoSlideInterval('start', parentId, slideTime);

        if (slideTime != 0) {
          let stopOnHover = context.getElementById(slideId);
          let playPause = context.getElementById(`btn-${parentId}`);
          let btnClasses = playPause.classList;
          btnClasses.add('vvjs__no-bottom-nav');

          const togglePlayPause = () => {
            isPaused = !isPaused;
            if (isPaused) {
              playPause.classList.replace('vvjs__play', 'vvjs__pause');
              playPause.innerHTML = '&#9654;';
              playPause.setAttribute('aria-label', 'Start automatic slide show');
              manageAutoSlideInterval('clear');
            } else {
              playPause.classList.replace('vvjs__pause', 'vvjs__play');
              playPause.innerHTML = '&#10073;&nbsp;&#10073;';
              playPause.setAttribute('aria-label', 'Stop automatic slide show');
              manageAutoSlideInterval('start', parentId, slideTime);
            }
          };

          stopOnHover.addEventListener('mouseover', () => {
            if (!isPaused) {
              manageAutoSlideInterval('clear');
            }
          });

          stopOnHover.addEventListener('mouseout', () => {
            if (!isPaused) {
              manageAutoSlideInterval('start', parentId, slideTime);
            }
          });

          playPause.addEventListener('click', togglePlayPause);
        }
      });

      once('init-vvjs__next', '.vvjs__inner .vvjs__next', context).forEach(element => {
        element.addEventListener('click', function(event) {
          handlePrevNextBtn(event.target.parentElement.id, getNextItemIndex);
        });
      });

      once('init-vvjs__prev', '.vvjs__inner .vvjs__prev', context).forEach(element => {
        element.addEventListener('click', function(event) {
          handlePrevNextBtn(event.target.parentElement.id, getPreviousItemIndex);
        });
      });

      once('init-bottom-nav', '.vvjs__inner .vvjs__slide-nav .vvjs__slide-bottom-btn', context).forEach(element => {
        element.addEventListener('click', function(event) {
          handleBottomNav(event.target.id, event.target.parentElement.id);
        });

        // Adding keydown event listener for tab key navigation
        element.addEventListener('keydown', function(event) {
          if (event.key === 'Tab') {
            const parentSlideshow = element.closest('.vvjs__inner');
            const allButtons = Array.from(parentSlideshow.querySelectorAll('.vvjs__slide-nav .vvjs__slide-bottom-btn'));
            const currentIndex = allButtons.indexOf(event.target);

            if (event.shiftKey) { // Shift + Tab to navigate backwards
              if (currentIndex > 0) {
                allButtons[currentIndex - 1].focus();
                event.preventDefault();
              }
            } else { // Tab to navigate forwards
              if (currentIndex < allButtons.length - 1) {
                allButtons[currentIndex + 1].focus();
                event.preventDefault();
              }
            }
          }
        });
      });
    }
  };
})(Drupal, drupalSettings, once);
