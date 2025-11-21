# -*- coding: utf-8 -*-
# Developed by XAPP.

{
    'name': 'FreshMart',
    'category': 'Theme',
    'version': '18.0.1.0.0',
    'sequence': 1,
    'author': 'XAPP',
    'summary': 'FreshMart - Odoo eCommerce Theme for Online Grocery Stores and Supermarkets',
    'description': """
        FreshMart - Website Theme for Odoo 18

      This Odoo grocery theme delivers a fast, clean, and user-friendly storefront tailored for supermarkets and convenience stores. 
      It includes optimized product sections, category highlights, 
      eye-catching banners, and a simple checkout flow—designed to 
      increase conversions and enhance customer engagement.

        Support:
        -
        For any questions or support, please contact.
    """,
    'license': 'OPL-1',
    'support': 'teamxapp.dev@gmail.com',
    'live_test_url': 'http://13.60.52.65:8071',
    'price': 169.00,
    'currency': 'USD',
    'depends': [
        'website',
        'web_editor',
        'website_sale',
        'sale_management',
        'crm',
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

    'images': [
        'static/description/freshmart_cover.jpg',
        'static/description/freshmart_screenshot.gif',

    ],

    'installable': True,
    'auto_install': False,
    'application': False,
}
