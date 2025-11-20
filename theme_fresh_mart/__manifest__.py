# -*- coding: utf-8 -*-
# FreshMart Theme Module Manifest
# ==============================
# Odoo theme module for grocery store eCommerce platform.
# Provides custom header, homepage, product pages, cart, and checkout styling.

{
    'name': 'FreshMart',
    'category': 'Theme',
    'version': '18.0.1.0.0',
    'sequence': 1,
    'depends': [
        'website',
        'web_editor',
        'website_sale',
        'sale_management',
    ],
    'data': [
        'views/templates.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            # Theme CSS Files
            'theme_fresh_mart/static/src/css/header.css',
            'theme_fresh_mart/static/src/css/banner.css',
            'theme_fresh_mart/static/src/css/categories.css',
            'theme_fresh_mart/static/src/css/product.css',
            'theme_fresh_mart/static/src/css/shop.css',
            'theme_fresh_mart/static/src/css/cart.css',
            'theme_fresh_mart/static/src/css/myhome.css',
            'theme_fresh_mart/static/src/css/checkout.css',
            'theme_fresh_mart/static/src/css/footer.css',
            'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
            # Theme JavaScript Files
            'theme_fresh_mart/static/src/js/header.js',
            'theme_fresh_mart/static/src/js/swiper-banner.js',
            'theme_fresh_mart/static/src/js/website_sale.js',
            'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
        ],
    },
    'installable': True,
    'auto_install': False,
    'application': False,
}
