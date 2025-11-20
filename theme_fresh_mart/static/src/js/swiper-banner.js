/**
 * Swiper Banner Initialization
 * 
 * Initializes Swiper.js banner slider on homepage with automatic retry mechanism.
 * Handles dynamic content loading and Odoo website editor compatibility.
 */
(function() {
    'use strict';

    var initAttempts = 0;
    var maxAttempts = 50; // Maximum initialization attempts (5 seconds total)

    /**
     * Initializes Swiper banner slider with configuration from data attributes
     * Retries initialization if Swiper library or container is not yet available
     */
    function initializeSwiperBanner() {
        initAttempts++;
        
        // Wait for Swiper library to load from CDN
        if (typeof Swiper === 'undefined') {
            if (initAttempts < maxAttempts) {
                setTimeout(initializeSwiperBanner, 100);
            } else {
                console.warn('Swiper library not loaded. Please check if the CDN link is working.');
            }
            return;
        }

        // Find banner container using multiple selectors for compatibility
        var swiperContainer = document.getElementById('swiper-banner') || 
                              document.querySelector('.swiper-container#swiper-banner') ||
                              document.querySelector('#swiper-banner.swiper-container');
        
        if (!swiperContainer) {
            // Retry if container not found (may still be loading)
            if (initAttempts < maxAttempts) {
                setTimeout(initializeSwiperBanner, 100);
                return;
            }
            console.warn('Swiper banner container not found after', maxAttempts, 'attempts');
            return;
        }
        
        // Skip if already initialized to prevent duplicate initialization
        if (swiperContainer.classList.contains('swiper-initialized')) {
            return;
        }
        
        // Initialize Swiper with configuration from data attributes
        try {
                var speed = parseInt(swiperContainer.getAttribute('data-speed')) || 600;
                var spaceBetween = parseInt(swiperContainer.getAttribute('data-space-between')) || 0;
                var paginationEnabled = swiperContainer.getAttribute('data-pagination') === 'true';
                var navigationEnabled = swiperContainer.getAttribute('data-navigation') === 'true';
                var autoplayEnabled = swiperContainer.getAttribute('data-autoplay') === 'true';
                var autoplayDelay = parseInt(swiperContainer.getAttribute('data-autoplay-delay')) || 4000;
                var paginationType = swiperContainer.getAttribute('data-pagination-type') || 'bullets';
                var effect = swiperContainer.getAttribute('data-effect') || 'fade';

                var swiperOptions = {
                    speed: speed,
                    spaceBetween: spaceBetween,
                    effect: effect,
                    loop: true,
                    grabCursor: true,
                    autoplay: autoplayEnabled ? {
                        delay: autoplayDelay,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    } : false,
                };

                if (effect === 'fade') {
                    swiperOptions.fadeEffect = {
                        crossFade: true,
                    };
                }

                if (paginationEnabled) {
                    var paginationEl = swiperContainer.querySelector('.swiper-pagination');
                    if (paginationEl) {
                        swiperOptions.pagination = {
                            el: paginationEl,
                            type: paginationType,
                            dynamicBullets: true,
                            clickable: true,
                        };
                    }
                }

                if (navigationEnabled) {
                    var navigationEl = swiperContainer.querySelector('.swiper-navigation');
                    if (navigationEl) {
                        var nextEl = navigationEl.querySelector('.swiper-button-next');
                        var prevEl = navigationEl.querySelector('.swiper-button-prev');
                        if (nextEl && prevEl) {
                            swiperOptions.navigation = {
                                nextEl: nextEl,
                                prevEl: prevEl,
                            };
                        }
                    }
                } else {
                    // Hide navigation if not enabled
                    var navigationEl = swiperContainer.querySelector('.swiper-navigation');
                    if (navigationEl) {
                        navigationEl.style.display = 'none';
                    }
                }

                // Create Swiper instance with configured options
                var swiperInstance = new Swiper(swiperContainer, swiperOptions);
                console.log('Swiper banner initialized successfully', swiperInstance);
                
                // Mark container as initialized
                swiperContainer.setAttribute('data-swiper-initialized', 'true');
                
        } catch (error) {
            console.error('Error initializing Swiper:', error);
        }
    }

    /**
     * Initialize Swiper when DOM is ready
     * Delays initialization slightly to ensure all elements are rendered
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initializeSwiperBanner, 200);
        });
    } else {
        setTimeout(initializeSwiperBanner, 200);
    }

    /**
     * Re-initialize Swiper when content is updated dynamically
     * This handles Odoo website editor and AJAX content updates
     */
    if (window.MutationObserver) {
        var observer = new MutationObserver(function(mutations) {
            var shouldReinit = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    for (var i = 0; i < mutation.addedNodes.length; i++) {
                        var node = mutation.addedNodes[i];
                        if (node.nodeType === 1) {
                            if (node.id === 'swiper-banner' || (node.querySelector && node.querySelector('#swiper-banner'))) {
                                shouldReinit = true;
                                break;
                            }
                        }
                    }
                }
            });
            if (shouldReinit) {
                initAttempts = 0;
                setTimeout(initializeSwiperBanner, 300);
            }
        });

        // Start observing DOM changes
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                if (document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
            });
        }
    }

})();
