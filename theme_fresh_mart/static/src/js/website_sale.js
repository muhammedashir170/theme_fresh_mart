/** @odoo-module **/
/**
 * FreshMart Website Sale Enhancements
 * 
 * Extends Odoo's WebsiteSale widget to:
 * - Handle AJAX add-to-cart on product listing pages (homepage, shop page)
 * - Update discount badges based on quantity and pricelist rules
 * - Patch stock functionality to work on listing pages
 * - Ensure cart notifications display correctly on listing pages
 */

import { WebsiteSale } from "@website_sale/js/website_sale";
import VariantMixin from "@website_sale/js/sale_variant_mixin";
import wSaleUtils from "@website_sale/js/website_sale_utils";
import { rpc } from "@web/core/network/rpc";
import publicWidget from "@web/legacy/js/public/public_widget";

/**
 * Patches VariantMixin._onChangeCombinationStock to handle listing pages
 * Prevents errors when required elements don't exist on product listing pages
 * @private
 */
const patchStockFunction = () => {
    if (VariantMixin._onChangeCombinationStock && !VariantMixin._onChangeCombinationStock._patched) {
        const originalOnChangeCombinationStock = VariantMixin._onChangeCombinationStock;
        VariantMixin._onChangeCombinationStock = function(ev, $parent, combination) {
            // Check if required element exists before accessing it
            const ctaWrapper = $parent && $parent[0] && $parent[0].querySelector('#o_wsale_cta_wrapper');
            if (!ctaWrapper) {
                // Required element doesn't exist on listing pages - skip stock functionality
                return;
            }
            // Element exists - call original function
            return originalOnChangeCombinationStock.apply(this, arguments);
        };
        VariantMixin._onChangeCombinationStock._patched = true;
    }
};

// Apply patch immediately if function exists
patchStockFunction();

/**
 * Extend WebsiteSale widget with FreshMart-specific functionality
 */
WebsiteSale.include({
    start: function() {
        const result = this._super.apply(this, arguments);
        // Patch stock function after widget starts (all modules should be loaded by now)
        patchStockFunction();
        // Ensure redirect option is checked
        this.getRedirectOption();

        // Add event handler for add to cart buttons on listing pages
        // This ensures they use AJAX instead of form submission
        const productDetailMain = document.querySelector("#product_detail_main");
        const isListingPage = !productDetailMain;
        if (isListingPage) {
            // Prevent form submission for product forms on listing pages
            // Use capture phase to run before other handlers
            this.$el.on('submit', 'form.js_product', (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                ev.stopImmediatePropagation();
                // Find the add to cart button and trigger click handler
                const $form = $(ev.currentTarget);
                const $addToCartBtn = $form.find('.js_check_product.a-submit');
                if ($addToCartBtn.length) {
                    // Create a synthetic event to pass to _onClickAdd
                    const syntheticEv = $.Event('click', {
                        currentTarget: $addToCartBtn[0],
                        target: $addToCartBtn[0],
                        preventDefault: () => {},
                        stopPropagation: () => {},
                        stopImmediatePropagation: () => {}
                    });
                    this._onClickAdd(syntheticEv);
                }
                return false;
            });

            // Also handle button clicks directly to ensure they're caught
            // This runs before the default _onClickSubmit handler
            this.$el.on('click', '.js_check_product.a-submit', (ev) => {
                const productDetailMain = document.querySelector("#product_detail_main");
                if (!productDetailMain) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    // Call _onClickAdd directly
                    this._onClickAdd(ev);
                    return false;
                }
            });

            // Add direct event listener for quantity changes on listing pages
            // This ensures we catch all quantity changes, including from plus/minus buttons
            this.$el.on('change', 'form.js_product input[name="add_qty"]', (ev) => {
                this._handleQuantityChange(ev);
            });

            // Also listen for click events on plus/minus buttons to update immediately
            // This handles the case where onClickAddCartJSON updates the input value
            this.$el.on('click', 'a.js_add_cart_json', (ev) => {
                const $link = $(ev.currentTarget);
                // Only handle if it's a quantity button (has fa-plus or fa-minus icon)
                if ($link.find('.fa-plus, .fa-minus').length > 0) {
                    // Wait a bit for the input value to update, then trigger change
                    setTimeout(() => {
                        const $input = $link.closest('.input-group, .quantity-selector').find('input[name="add_qty"]');
                        if ($input.length) {
                            // Manually trigger our handler to ensure it runs
                            $input.trigger('change');
                        }
                    }, 50);
                }
            });
        } else {
            // On product detail pages, also listen for quantity changes
            this.$el.on('change', 'form.js_product input[name="add_qty"]', (ev) => {
                this._handleQuantityChange(ev);
            });
        }

        return result;
    },

    /**
     * Override form submission handler to use AJAX on listing pages
     * Prevents page reload and ensures cart notifications display correctly
     * @override
     */
    _onClickSubmit: function (ev) {
        const productDetailMain = document.querySelector("#product_detail_main");
        const isListingPage = !productDetailMain;
        const $target = $(ev.currentTarget);

        // Use AJAX on listing pages to prevent page reload
        if (isListingPage && ($target.is('.js_check_product') || $target.closest('.js_product').length)) {
            ev.preventDefault();
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            return this._onClickAdd(ev);
        }

        // Default behavior for product detail pages
        if ($target.is('#add_to_cart, #products_grid .o_wsale_product_btn .a-submit')) {
            return;
        }

        return this._super.apply(this, arguments);
    },


    /**
     * Override add to cart handler to ensure notifications display on listing pages
     * Forces stay-on-page behavior to show cart notifications without page reload
     * @override
     */
    _onClickAdd: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();

        const productDetailMain = document.querySelector("#product_detail_main");
        const isListingPage = !productDetailMain;

        // Force stay on page to show cart notification
        if (isListingPage) {
            this.stayOnPageOption = true;
        }

        var def = () => {
            this.getCartHandlerOptions(ev);
            return this._handleAdd($(ev.currentTarget).closest('form'));
        };
        if ($('.js_add_cart_variants').children().length) {
            return this._getCombinationInfo(ev).then(() => {
                return !$(ev.target).closest('.js_product').hasClass("css_not_available") ? def() : Promise.resolve();
            });
        }
        return def();
    },
    _getProductImageLayout: function () {
        const productDetailMain = document.querySelector("#product_detail_main");
        if (productDetailMain && productDetailMain.dataset) {
            return productDetailMain.dataset.image_layout;
        }
        // Return null/undefined if not on product detail page
        return null;
    },

    _getProductImageWidth: function () {
        const productDetailMain = document.querySelector("#product_detail_main");
        if (productDetailMain && productDetailMain.dataset) {
            return productDetailMain.dataset.image_width;
        }
        // Return null/undefined if not on product detail page
        return null;
    },

    _getProductImageContainerSelector: function () {
        const layout = this._getProductImageLayout();
        if (layout) {
            return {
                'carousel': "#o-carousel-product",
                'grid': "#o-grid-product",
            }[layout];
        }
        // Return null if not on product detail page
        return null;
    },

    /**
     * Override _updateProductImage to handle listing pages where #product_detail_main doesn't exist
     */
    _updateProductImage: function ($productContainer, displayImage, productId, productTemplateId, newImages, isCombinationPossible) {
        // Only try to update images if we're on a product detail page
        // On listing pages, use the base implementation from VariantMixin
        const productDetailMain = document.querySelector("#product_detail_main");
        if (!productDetailMain) {
            // On listing pages, use VariantMixin's implementation which updates images
            // within the product container using standard selectors
            return VariantMixin._updateProductImage.apply(this, arguments);
        }

        // On product detail pages, use the original WebsiteSale implementation
        let $images = $productContainer.find(this._getProductImageContainerSelector());
        // When using the web editor, don't reload this or the images won't
        // be able to be edited depending on if this is done loading before
        // or after the editor is ready.
        if ($images.length && !this._isEditorEnabled()) {
            const $newImages = $(newImages);
            $images.after($newImages);
            $images.remove();
            $images = $newImages;
            // Update the sharable image (only work for Pinterest).
            const shareImageSrc = $images[0].querySelector('img').src;
            const ogImageMeta = document.querySelector('meta[property="og:image"]');
            if (ogImageMeta) {
                ogImageMeta.setAttribute('content', shareImageSrc);
            }

            if ($images.attr('id') === 'o-carousel-product') {
                $images.carousel(0);
            }
            this._startZoom();
            // fix issue with carousel height
            this.trigger_up('widgets_start_request', {$target: $images});
        }
        if ($images.length) {
            $images.toggleClass('css_not_available', !isCombinationPossible);
        }
    },

    /**
     * Override _onChangeCombination to update discount badge when combination info changes
     * This handles both quantity changes and variant changes
     */
    _onChangeCombination: function (ev, $parent, combination) {
        // Call parent implementation first to update prices and other UI
        VariantMixin._onChangeCombination.apply(this, arguments);

        // Update discount badge based on combination info
        this._updateDiscountBadgeForQuantity($parent, combination);
    },

    /**
     * Handles quantity change events and updates discount badge
     * Fetches combination info with new quantity and recalculates discount
     * @param {jQuery.Event} ev - Change event from quantity input
     * @private
     */
    _handleQuantityChange: function (ev) {
        const $input = $(ev.currentTarget);
        const $parent = $input.closest('form.js_product, form.oe_product_cart');

        if ($parent.length === 0) {
            return;
        }

        const quantity = parseFloat($input.val() || 1);
        if (isNaN(quantity) || quantity < 1) {
            return;
        }

        const productTemplateId = parseInt($parent.find('input[name="product_template_id"]').val());
        const productId = parseInt($parent.find('input[name="product_id"]').val()) ||
                         parseInt($parent.find('input.js_product_change:checked').val()) ||
                         parseInt($parent.find('.product_id').val());

        if (!productTemplateId) {
            console.warn('No product template ID found for quantity change');
            return;
        }

        // Fetch combination info with updated quantity
        const combination = this.getSelectedVariantValues($parent);
        const self = this;

        rpc('/website_sale/get_combination_info', {
            'product_template_id': productTemplateId,
            'product_id': productId || false,
            'combination': combination,
            'add_qty': quantity,
            'parent_combination': [],
            'context': this.context || {},
        }).then((combinationInfo) => {
            if (!combinationInfo) {
                console.warn('No combination info returned');
                return;
            }
            self._updateDiscountBadgeForQuantity($parent, combinationInfo);
        }).catch((error) => {
            console.error('Error fetching combination info for quantity change:', error);
        });
    },

    /**
     * Override onClickAddCartJSON to update badge after quantity change
     */
    onClickAddCartJSON: function (ev) {
        // Call parent implementation first to update quantity
        const result = VariantMixin.onClickAddCartJSON.apply(this, arguments);

        // After quantity is updated, trigger our handler
        const $link = $(ev.currentTarget);
        if ($link.find('.fa-plus, .fa-minus').length > 0) {
            // It's a quantity button, update badge after a short delay
            setTimeout(() => {
                const $input = $link.closest('.input-group, .quantity-selector').find('input[name="add_qty"]');
                if ($input.length) {
                    // Create a synthetic change event
                    const changeEv = $.Event('change', {
                        target: $input[0],
                        currentTarget: $input[0]
                    });
                    this._handleQuantityChange(changeEv);
                }
            }, 100);
        }

        return result;
    },

    /**
     * Override onChangeAddQuantity to fetch combination info when quantity changes
     * This ensures the discount badge updates based on pricelist min_quantity rules
     */
    onChangeAddQuantity: function (ev) {
        // Also handle via our direct handler
        this._handleQuantityChange(ev);

        // Call parent implementation to handle other variant changes
        return VariantMixin.onChangeAddQuantity.apply(this, arguments);
    },

    /**
     * Updates discount badge visibility and percentage based on combination info
     * Creates badge if it doesn't exist, updates if it does, or hides if no discount
     * @param {jQuery} $product - Product form container
     * @param {Object} combinationInfo - Combination info from server
     * @private
     */
    _updateDiscountBadgeForQuantity: function ($product, combinationInfo) {
        const listPrice = combinationInfo.list_price || 0;
        const price = combinationInfo.price || 0;
        const hasDiscountedPrice = combinationInfo.has_discounted_price && listPrice > 0 && price < listPrice;

        // Calculate discount percentage
        let discountPercent = 0;
        if (hasDiscountedPrice && listPrice > 0) {
            discountPercent = Math.round(((listPrice - price) / listPrice) * 100);
        }

        const $imageContainer = $product.find('.oe_product_image');
        if ($imageContainer.length === 0) {
            return;
        }

        let $badge = $imageContainer.find('.badge.bg-danger');

        // Ensure image container has position-relative for absolute positioning
        if ($imageContainer.css('position') === 'static' || !$imageContainer.hasClass('position-relative')) {
            $imageContainer.addClass('position-relative');
        }

        if (discountPercent > 0) {
            // Create or update discount badge
            if ($badge.length === 0) {
                $badge = $('<span>', {
                    class: 'position-absolute top-0 end-0 m-2 badge bg-danger text-white rounded-pill discount-badge-qty',
                    css: {
                        'z-index': '10',
                        'font-size': '0.875rem',
                        'padding': '0.5rem 0.75rem'
                    },
                    text: discountPercent + '% OFF'
                });
                $imageContainer.prepend($badge);
            } else {
                $badge.text(discountPercent + '% OFF')
                      .removeClass('d-none')
                      .show()
                      .css('display', '');
            }
        } else {
            // Hide badge if no discount applies
            if ($badge.length > 0) {
                $badge.hide();
            }
        }
    },

});
