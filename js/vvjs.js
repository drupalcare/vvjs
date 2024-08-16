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

      const slides = once('vvjs', '.vvjs-items', context);
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

      // Manage the auto-slide interval, including stopping when slideTime is 0
      const manageAutoSlideInterval = (action, slideshowId, slideTime) => {
        if (action === 'clear' && autoSlideIntervalId) {
          clearInterval(autoSlideIntervalId);
          autoSlideIntervalId = null;
        } else if (action === 'start' && slideTime > 0 && !autoSlideIntervalId) {
          autoSlideIntervalId = setInterval(() => autoSlide(slideshowId, getNextItemIndex), slideTime);
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
        slides.forEach((slide, index) => {
          const slideElement = context.getElementById(slide.id);
          if (slideElement && window.getComputedStyle(slideElement).display === 'block') {
            slideIndex = index + 1;
          }
        });
        return slideIndex;
      };

      const updateNavigationState = (slideshowId, activeSlideId) => {
        const allButtons = context.querySelectorAll(`#vvjs-inner-${slideshowId}>.nav-dots-numbers>.dots-numbers-button`);
        const announcer = context.getElementById(`slideshow-announcer-${slideshowId}`);

        allButtons.forEach(button => {
          const buttonId = getElementId(button.id, 3);
          if (buttonId === activeSlideId) {
            button.classList.add('active');
            button.removeAttribute('tabindex');
            button.setAttribute('aria-selected', 'true');
            button.setAttribute('tabindex', '0');
            announcer.textContent = `Slide ${buttonId} selected`; // Update the live region with the selected slide number
          } else {
            button.classList.remove('active');
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('tabindex', '-1');
          }
        });
      };

      const updateSlideVisibility = (slideshowId, activeSlideId) => {
        const slides = context.querySelectorAll(`#vvjs-items-${slideshowId}>.vvjs-item`);
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

      const handlePrevNextBtn = (elementId, itemFunction) => {
        const slideshowId = getElementId(elementId, 2);
        manageAutoSlideInterval('clear');
        const slides = context.querySelectorAll(`#vvjs-items-${slideshowId}>.vvjs-item`);
        const totalSlides = slides.length;
        const slideId = itemFunction(totalSlides);

        updateSlideVisibility(slideshowId, slideId);
        updateNavigationState(slideshowId, slideId);

        const slideTime = parseInt(context.querySelector(`#vvjs-inner-${slideshowId}`)?.getAttribute('data-time'), 10);
        if (!isPaused && slideTime > 0) {
          manageAutoSlideInterval('start', slideshowId, slideTime);
        }
      };

      const handleBottomNav = (buttonId, parentId) => {
        const slideId = getElementId(buttonId, 3);
        const slideshowId = getElementId(parentId, 3);
        manageAutoSlideInterval('clear');

        const slides = context.querySelectorAll(`#vvjs-items-${slideshowId}>.vvjs-item`);
        slides.forEach(slide => {
          const currentSlideId = parseInt(slide.id.split('-').pop());
          if (currentSlideId === slideId) {
            slide.style.display = 'block';
            slide.setAttribute('aria-hidden', 'false');
            slide.focus();
          } else {
            slide.style.display = 'none';
            slide.setAttribute('aria-hidden', 'true');
          }
        });

        updateNavigationState(slideshowId, slideId);
        slideIndex = slideId;

        const slideTime = parseInt(context.querySelector(`#vvjs-inner-${slideshowId}`)?.getAttribute('data-time'), 10);
        if (!isPaused && slideTime > 0) {
          manageAutoSlideInterval('start', slideshowId, slideTime);
        }
      };

      const autoSlide = (slideshowId, itemFunction) => {
        const slides = context.querySelectorAll(`#vvjs-items-${slideshowId}>.vvjs-item`);
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

        updateNavigationState(slideshowId, slideId);
      };

      once('init-slides', slides).forEach(slide => {
        const slideshowId = getElementId(slide.id, 2);
        const slideTime = parseInt(context.querySelector(`#vvjs-inner-${slideshowId}`)?.getAttribute('data-time'), 10);

        manageAutoSlideInterval('start', slideshowId, slideTime);

        if (slideTime > 0) {
          const stopOnHover = context.getElementById(slide.id);
          const playPause = context.getElementById(`play-pause-button-${slideshowId}`);
          const btnClasses = playPause?.classList;
          btnClasses?.add('dots-numbers-inactive');

          const togglePlayPause = () => {
            isPaused = !isPaused;

            if (playPause) {
              playPause.innerHTML = '';
              if (isPaused) {
                playPause.classList.replace('play', 'pause');
                playPause.innerHTML = playIconSVG;
                playPause.setAttribute('aria-label', 'Start automatic slide show');
                manageAutoSlideInterval('clear');
              } else {
                playPause.classList.replace('pause', 'play');
                playPause.innerHTML = pauseIconSVG;
                playPause.setAttribute('aria-label', 'Stop automatic slide show');
                manageAutoSlideInterval('start', slideshowId, slideTime);
              }
            }
          };

          // Pause the slideshow on hover
          stopOnHover?.addEventListener('mouseover', () => {
            if (!isPaused) {
              manageAutoSlideInterval('clear');
            }
          });

          // Resume the slideshow when hover ends
          stopOnHover?.addEventListener('mouseout', () => {
            if (!isPaused) {
              manageAutoSlideInterval('start', slideshowId, slideTime);
            }
          });

          // Toggle play/pause on button click
          playPause?.addEventListener('click', togglePlayPause);
        }
      });

      // Initialize next arrow button
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

      // Initialize previous arrow button
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

      // Initialize bottom navigation buttons
      once('init-bottom-nav', '.slideshow-inner .nav-dots-numbers .dots-numbers-button', context).forEach(element => {
        element.addEventListener('click', function(event) {
          handleBottomNav(event.target.id, event.target.parentElement.id);
        });

        // Adding keydown event listener for keyboard navigation
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
