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

  Drupal.behaviors.VVJSlideshow = {
    attach: function(context, settings) {

      const slides = once('ViewsVanillaJsSlideshow', '.slideshow-items', context);
      if (!slides.length) {
        return;
      }

      let slideIndex = 1;
      let autoSlideIntervalId = null;
      let isPaused = false;

      const playIconSVG = `
        <svg class="svg-play" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="inherit">
          <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>`;

      const pauseIconSVG = `
        <svg class="svg-pause" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="inherit">
          <path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>`;

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

      const getElementId = (element, number) => {
        return parseInt(element.split('-')[number]);
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
        const allButtons = context.querySelectorAll(`#vvjs-wrap-${parentId}>.nav-dots-numbers>.dots-numbers-button`);
        allButtons.forEach(button => {
          const buttonId = getElementId(button.id, 3);
          if (buttonId === activeSlideId) {
            button.classList.add('active');
            button.removeAttribute('tabindex');
            button.setAttribute('aria-selected', 'true');
          } else {
            button.classList.remove('active');
            button.setAttribute('tabindex', '-1');
            button.setAttribute('aria-selected', 'false');
          }
        });
      };

      const updateSlideVisibility = (parentId, activeSlideId) => {
        const slides = context.querySelectorAll(`#slideshow-items-${parentId}>.slideshow-item`);
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
        const slidesSelector = `#slideshow-items-${parentId}>.slideshow-item`;
        const currentIdSelector = `#slideshow-items-${parentId}>#slideshow-item-${parentId}-${slideId}`;
        const activeButtonSelector = `#vvjs-wrap-${parentId}>.nav-dots-numbers>#dots-numbers-button-${slideId}`;
        const allActiveClassesSelector = `#vvjs-wrap-${parentId}>.nav-dots-numbers>.dots-numbers-button`;

        let slides = context.querySelectorAll(slidesSelector);
        let selectedPane = context.querySelector(currentIdSelector);
        let activeButton = context.querySelector(activeButtonSelector);
        let allActiveClasses = context.querySelectorAll(allActiveClassesSelector);

        allActiveClasses.forEach(element => {
          element.classList.remove('active');
        });

        slides.forEach(element => {
          element.style.display = 'none';
        });

        return [selectedPane, activeButton];
      };

      const handlePrevNextBtn = (element, itemFunction) => {
        const parentId = getElementId(element, 2);
        manageAutoSlideInterval('clear');
        const slides = context.querySelectorAll(`#slideshow-items-${parentId}>.slideshow-item`);
        const totalSlides = slides.length;
        const slideId = itemFunction(totalSlides);

        updateSlideVisibility(parentId, slideId);
        updateNavigationState(parentId, slideId);
        // Resume auto-slide if it was playing
        let slideTime = parseInt(context.querySelector(`#vvjs-wrap-${parentId}`).getAttribute('data-time'), 10);
        if (!isPaused && slideTime != 0) {
          manageAutoSlideInterval('start', parentId, slideTime);
        }
      };

      const handleBottomNav = (e, p) => {
        const slideId = getElementId(e, 3);
        const parentId = getElementId(p, 3);
        manageAutoSlideInterval('clear');

        const slides = context.querySelectorAll(`#slideshow-items-${parentId}>.slideshow-item`);
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
        let slideTime = parseInt(context.querySelector(`#vvjs-wrap-${parentId}`).getAttribute('data-time'), 10);
        if (!isPaused && slideTime != 0) {
          manageAutoSlideInterval('start', parentId, slideTime);
        }
      };

      const autoSlide = (parentId, itemFunction) => {
        const slides = context.querySelectorAll(`#slideshow-items-${parentId}>.slideshow-item`);
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
        let parentId = getElementId(slideId, 2);
        let slideTime = parseInt(context.querySelector(`#vvjs-wrap-${parentId}`).getAttribute('data-time'), 10);
        manageAutoSlideInterval('start', parentId, slideTime);
        if (slideTime != 0) {
          let stopOnHover = context.getElementById(slideId);
          let playPause = context.getElementById(`play-pause-button-${parentId}`);
          let btnClasses = playPause.classList;
          btnClasses.add('dots-numbers-inactive');


          const togglePlayPause = () => {
            isPaused = !isPaused;

            // Clear any existing content
            playPause.innerHTML = '';

            if (isPaused) {
              playPause.classList.replace('play', 'pause');
              playPause.innerHTML = playIconSVG; // Set to play icon
              playPause.setAttribute('aria-label', 'Start automatic slide show');
              manageAutoSlideInterval('clear');
            } else {
              playPause.classList.replace('pause', 'play');
              playPause.innerHTML = pauseIconSVG; // Set to pause icon
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

      once('init-next-arrow', '.slideshow-inner button.next-arrow', context).forEach(element => {
        element.addEventListener('click', function(event) {
          const buttonElement = event.target.closest('button');
          if (buttonElement) {
            const parentElement = buttonElement.parentElement;
            if (parentElement) {
              handlePrevNextBtn(parentElement.id, getNextItemIndex);
            }
          }
        });
      });

      once('init-prev-arrow', '.slideshow-inner button.prev-arrow', context).forEach(element => {
        element.addEventListener('click', function(event) {
          const buttonElement = event.target.closest('button');
          if (buttonElement) {
            const parentElement = buttonElement.parentElement;
            if (parentElement) {
              handlePrevNextBtn(parentElement.id, getPreviousItemIndex);
            }
          }
        });
      });

      once('init-bottom-nav', '.slideshow-inner .nav-dots-numbers .dots-numbers-button', context).forEach(element => {
        element.addEventListener('click', function(event) {
          handleBottomNav(event.target.id, event.target.parentElement.id);
        });

        // Adding keydown event listener for tab key navigation
        element.addEventListener('keydown', function(event) {
          if (event.key === 'Tab') {
            const parentSlideshow = element.closest('.slideshow-inner');
            const allButtons = Array.from(parentSlideshow.querySelectorAll('.nav-dots-numbers .dots-numbers-button'));
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
