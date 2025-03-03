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
      const slideshows = once('vvjSlideshow', '.vvjs>.vvjs-inner>.vvjs-items', context);
      if (!slideshows.length) {
        return;
      }
      slideshows.forEach((slideshow) => {
        const slideshowInner = slideshow.closest('.vvjs-inner');
        const slideshowId = slideshow.id;
        let slideIndex = 1;
        let autoSlideIntervalId = null;
        let isPaused = false;
        let progressIntervalId = null;
        let slideStartTime = Date.now();
        const slides = slideshowInner.querySelectorAll('.vvjs-item');
        const slideTime = parseInt(slideshowInner.getAttribute('data-time'), 10) || 0;
        const showSlideProgress = slideshowInner.getAttribute('data-show-slide-progress') === 'true';
        const totalSlides = parseInt(slideshowInner.getAttribute('data-total-slides'), 10) || 0;
        const progressBar = slideshowInner.querySelector('.echo-animation .progressbar');
        const announcer = slideshowInner.querySelector('.announcer');
        const announceSlide = (activeIndex) => {
          if (announcer) {
            announcer.textContent = `Slide ${activeIndex} selected`;
          }
        };

      const playIconSVG = `
        <svg class="svg-play" xmlns="http://www.w3.org/2000/svg" viewBox="80 -880 800 800" fill="currentColor">
          <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path>
        </svg>`;

      const pauseIconSVG = `
        <svg class="svg-pause" xmlns="http://www.w3.org/2000/svg" viewBox="80 -880 800 800" fill="currentColor"><path d="M360-320h80v-320h-80v320Zm160 0h80v-320h-80v320ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"></path></svg>`;

        const updateSlideVisibility = (activeIndex) => {
          slides.forEach((slide, index) => {
            const isActive = index + 1 === activeIndex;
            slide.style.display = isActive ? 'block' : 'none';
            slide.classList.toggle('active', isActive);

            if (!isActive) {
              slide.setAttribute('inert', '');
              slide.setAttribute('aria-hidden', 'true');
              slide.setAttribute('tabindex', '-1');
              slide.querySelectorAll('a, button, input, textarea, select').forEach((el) => {
                el.setAttribute('tabindex', '-1');
              });
            } else {
              slide.removeAttribute('inert');
              slide.removeAttribute('aria-hidden');
              slide.setAttribute('tabindex', '0');
              slide.querySelectorAll('a, button, input, textarea, select').forEach((el) => {
                el.removeAttribute('tabindex');
              });
            }

          });
          updateNavigationState(activeIndex);
          updateProgressBar();
          announceSlide(activeIndex);
        };

        const updateNavigationState = (activeIndex) => {
          const navDots = slideshowInner.querySelectorAll('.dots-numbers-button');
          navDots.forEach((dot, index) => {
            const isActive = index + 1 === activeIndex;
            dot.classList.toggle('active', isActive);
            dot.setAttribute('aria-selected', isActive);
          });
          const currentSlideElement = slideshowInner.querySelector('.echo-total .current-slide');
          const totalSlidesElement = slideshowInner.querySelector('.echo-total .total-slides');
          if (currentSlideElement && totalSlidesElement) {
            currentSlideElement.textContent = activeIndex;
            totalSlidesElement.textContent = slides.length;
          }
        };
        const updateProgressBar = () => {
          if (!showSlideProgress || !progressBar || slideTime === 0) return;
          const elapsed = Date.now() - slideStartTime;
          const progress = (elapsed / slideTime) * 100;
          if (progress > 100) {
            progressBar.style.setProperty('--progress', `100%`);
            progressBar.setAttribute('aria-valuenow', 100);
            clearInterval(progressIntervalId); // Stop when progress completes
          } else {
            progressBar.style.setProperty('--progress', `${progress}%`);
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
          }
        };
        const startProgressBar = () => {
          clearInterval(progressIntervalId); // Clear any existing interval
          slideStartTime = Date.now(); // Reset start time
          progressIntervalId = setInterval(updateProgressBar, 50); // Update every 50ms
        };
        const startAutoSlide = () => {
          stopAutoSlide();
          if (slideTime > 0 && !isPaused) {
            startProgressBar(); // Start progress bar for the current slide
            autoSlideIntervalId = setInterval(() => {
              slideIndex = (slideIndex % slides.length) + 1;
              updateSlideVisibility(slideIndex);
              startProgressBar(); // Reset progress bar for the next slide
            }, slideTime);
          }
        };
        const stopAutoSlide = () => {
          clearInterval(autoSlideIntervalId);
          clearInterval(progressIntervalId); // Stop progress updates
          autoSlideIntervalId = null;
        };
        const initializeControls = () => {
          const nextButton = slideshowInner.querySelector('.next-arrow');
          const prevButton = slideshowInner.querySelector('.prev-arrow');
          const playPauseButton = slideshowInner.querySelector('.play-pause-button');
          const navDots = slideshowInner.querySelectorAll('.dots-numbers-button');

          // Set the initial icon for playPauseButton
          if (playPauseButton) {
            playPauseButton.innerHTML = isPaused ? playIconSVG : pauseIconSVG; // Set initial state
          }

          if (nextButton) {
            nextButton.addEventListener('click', () => {
              slideIndex = (slideIndex % slides.length) + 1;
              slideStartTime = Date.now();
              updateSlideVisibility(slideIndex);
              startAutoSlide();
            });
          }
          if (prevButton) {
            prevButton.addEventListener('click', () => {
              slideIndex = slideIndex === 1 ? slides.length : slideIndex - 1;
              slideStartTime = Date.now();
              updateSlideVisibility(slideIndex);
              startAutoSlide();
            });
          }
          if (playPauseButton) {
            playPauseButton.addEventListener('click', () => {
              isPaused = !isPaused;
              if (isPaused) {
                stopAutoSlide();
                playPauseButton.innerHTML = playIconSVG; // Set play icon when paused
                playPauseButton.setAttribute('aria-label', 'Play slideshow');
              } else {
                startAutoSlide();
                playPauseButton.innerHTML = pauseIconSVG; // Set pause icon when playing
                playPauseButton.setAttribute('aria-label', 'Pause slideshow');
              }
              updateProgressBar();
            });
          }
          navDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
              slideIndex = index + 1;
              slideStartTime = Date.now();
              updateSlideVisibility(slideIndex);
              startAutoSlide();
            });
          });
        };

        const initializeHoverPause = () => {
          slideshow.addEventListener('mouseover', stopAutoSlide);
          slideshow.addEventListener('mouseout', startAutoSlide);
        };

        const initializeKeyboardNavigation = () => {
          document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
              // Navigate to the next slide
              slideIndex = (slideIndex % slides.length) + 1;
              slideStartTime = Date.now(); // Reset the progress timer
              updateSlideVisibility(slideIndex);

              stopAutoSlide(); // Stop the auto-slide temporarily
              setTimeout(startAutoSlide, 300); // Restart auto-slide after a short delay
            } else if (event.key === 'ArrowLeft') {
              // Navigate to the previous slide
              slideIndex = slideIndex === 1 ? slides.length : slideIndex - 1;
              slideStartTime = Date.now();
              updateSlideVisibility(slideIndex);

              stopAutoSlide(); // Stop the auto-slide temporarily
              setTimeout(startAutoSlide, 300); // Restart auto-slide after a short delay
            } else if (event.key === ' ') {
              // Play or pause the slideshow
              event.preventDefault(); // Prevent scrolling when pressing space
              isPaused = !isPaused;
              if (isPaused) {
                stopAutoSlide();
              } else {
                startAutoSlide();
              }
              updateProgressBar();
            }
          });
        };

        const initializeSwipeNavigation = () => {
          let touchStartX = 0; // Starting X position
          let touchEndX = 0;   // Ending X position
          const swipeThreshold = 50; // Minimum distance (in pixels) to qualify as a swipe

          // Detect touch start
          slideshow.addEventListener('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
          });

          // Detect touch end
          slideshow.addEventListener('touchend', (event) => {
            touchEndX = event.changedTouches[0].clientX;
            handleSwipeGesture();
          });

          // Handle swipe gestures
          const handleSwipeGesture = () => {
            const swipeDistance = touchEndX - touchStartX;

            if (swipeDistance > swipeThreshold) {
              // Swipe right (previous slide)
              slideIndex = slideIndex === 1 ? slides.length : slideIndex - 1;
              slideStartTime = Date.now(); // Reset progress bar timer
              updateSlideVisibility(slideIndex);
              startAutoSlide(); // Restart auto-slide
            } else if (swipeDistance < -swipeThreshold) {
              // Swipe left (next slide)
              slideIndex = (slideIndex % slides.length) + 1;
              slideStartTime = Date.now();
              updateSlideVisibility(slideIndex);
              startAutoSlide();
            }
          };
        };

        function applyReducedMotionPreference() {
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

          if (prefersReducedMotion) {
            isPaused = true; // Stop autoplay.
            clearAllTimers(); // Stop any running timers (if already started).

            // Apply reduced motion styles.
            slideshow.style.transition = 'none';
            slides.forEach(slide => slide.style.transition = 'none');
            progressBar?.classList.add('reduced-motion');

            const playPauseButton = slideshowInner.querySelector('.play-pause-button');
            if (playPauseButton) {
              playPauseButton.innerHTML = playIconSVG; // Set the button to 'play' state.
              playPauseButton.setAttribute('aria-label', 'Play slideshow');
            }
          }
        }

        const initializeSlideshow = () => {
          updateSlideVisibility(slideIndex);
          initializeControls();
          initializeHoverPause();
          initializeKeyboardNavigation();
          initializeSwipeNavigation();
          applyReducedMotionPreference();
          if (slideTime > 0 && !isPaused) {
            startAutoSlide();
          }

          if (!slideshow.vvjVisibilityAttached) {
            slideshow.vvjVisibilityAttached = true;
            document.addEventListener('visibilitychange', () => {
              if (document.hidden) {
                stopAutoSlide();
              } else if (!isPaused) {
                startAutoSlide();
              }
            });
          }
        };

        initializeSlideshow();
      });
    }
  , };
})(Drupal, drupalSettings, once);
