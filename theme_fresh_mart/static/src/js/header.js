/** @odoo-module **/
/**
 * freshmart Header Widget
 * 
 * Custom header widget for freshmart theme that:
 * - Moves Odoo's default user menu and cart to custom header location
 * - Copies menu items from default top menu to custom navigation
 * - Initializes mobile search toggle functionality
 */

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.FreshMartHeader = publicWidget.Widget.extend({
    selector: 'header.freshmart-header, header',
    
    /**
     * Initialize widget and set up header functionality
     * @override
     * @returns {Promise} Widget initialization promise
     */
    start: function () {
        const result = this._super.apply(this, arguments);
        
        // Initialize header functionality when DOM is ready
        this._moveOdooElements();
        this._copyMenuItems();
        this._initMobileSearch();
        
        return result;
    },

    /**
     * Moves Odoo's default user menu and cart elements to custom header location
     * Applies custom styling to match FreshMart theme design
     * @private
     */
    _moveOdooElements: function() {
        const $originalUserMenu = $('.o_user_menu').not('#user_menu_placeholder .o_user_menu');
        const $userMenuPlaceholder = $('#user_menu_placeholder');
        
        // Move user menu if it exists and placeholder is empty
        if ($originalUserMenu.length && $userMenuPlaceholder.length && $userMenuPlaceholder.children().length === 0) {
            $originalUserMenu.detach();
            $userMenuPlaceholder.replaceWith($originalUserMenu);
            $originalUserMenu.css({
                'list-style': 'none',
                'margin': '0',
                'padding': '0'
            });
        }
        
        // Apply custom styling to user menu elements
        $('.o_user_menu > a, .o_user_menu > button, .o_user_menu .dropdown-toggle').each(function() {
            const $el = $(this);
            if (!$el.hasClass('rounded-circle')) {
                $el.addClass('rounded-circle bg-light p-2 mx-1');
            }
        });
        
        // Sync cart quantity badge across all cart elements
        const $cartQuantity = $('.my_cart_quantity_parent .my_cart_quantity, .oe_cart .my_cart_quantity');
        if ($cartQuantity.length) {
            const quantity = parseInt($cartQuantity.text()) || 0;
            $('.my_cart_quantity').text(quantity).toggle(quantity > 0);
        }
    },

    /**
     * Copies menu items from Odoo's default top menu to custom menu locations
     * Ensures custom navigation displays all menu items from Odoo configuration
     * @private
     */
    _copyMenuItems: function() {
        const $originalMenu = $('#top_menu').not('#top_menu_custom');
        const $customMenu = $('#top_menu_custom');
        
        // Clone menu items if custom menu is empty
        if ($originalMenu.length && $customMenu.length && $customMenu.children().length === 0) {
            $originalMenu.children('li').each(function() {
                const $item = $(this).clone(true, true);
                $customMenu.append($item);
            });
        }
    },

    /**
     * Initializes mobile search bar toggle functionality
     * Handles show/hide animation and click-outside-to-close behavior
     * @private
     */
    _initMobileSearch: function() {
        const $searchToggle = $('#mobileSearchToggle');
        const $searchBar = $('#mobileSearchBar');
        const $searchInput = $('#mobileSearchBar input[type="text"], #mobileSearchBar .freshmart-search-input-mobile');
        
        if (!$searchToggle.length || !$searchBar.length) {
            return;
        }
        
        // Toggle search bar visibility on button click
        $searchToggle.on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isVisible = $searchBar.is(':visible');
            
            if (isVisible) {
                $searchBar.slideUp(200);
                $searchToggle.removeClass('active');
            } else {
                $searchBar.slideDown(200);
                $searchToggle.addClass('active');
                
                // Focus search input after animation completes
                setTimeout(function() {
                    if ($searchInput.length) {
                        $searchInput.focus();
                    }
                }, 250);
            }
        });
        
        // Close search bar when clicking outside
        $(document).on('click', function(e) {
            if (!$searchBar.is(e.target) && 
                $searchBar.has(e.target).length === 0 && 
                !$searchToggle.is(e.target) && 
                $searchToggle.has(e.target).length === 0) {
                
                if ($searchBar.is(':visible')) {
                    $searchBar.slideUp(200);
                    $searchToggle.removeClass('active');
                }
            }
        });
        
        // Prevent search bar from closing when clicking inside it
        $searchBar.on('click', function(e) {
            e.stopPropagation();
        });
    },
});

export default publicWidget.registry.FreshMartHeader;

