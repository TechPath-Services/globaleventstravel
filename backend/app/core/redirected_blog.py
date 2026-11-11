"""Thin deal posts that 301 on the public site.

Keep this tuple in sync with REDIRECTED_BLOG_SLUGS in
frontend/src/lib/seo/redirects.ts. The posts stay in the database; public
lists omit them so pagination and related-guide queries are not filled by
URLs the site redirects.
"""

REDIRECTED_BLOG_SLUGS = (
    "unbelievable-kedarkantha-trek-deals-you-cant-resist",
    "book-your-ultimate-winter-escape-kedarkantha-trek-discounts",
    "ready-for-adventure-kedarkantha-trek-packages-on-sale-now",
    "score-big-savings-on-kedarkantha-trek-gear-today",
    "last-minute-kedarkantha-booking-tips-tricks",
    "kedarkantha-trek-made-affordable-best-budget-options",
    "discover-hidden-discounts-on-kedarkantha-trek-tours",
    "exclusive-offers-on-guided-kedarkantha-expeditions",
    "secure-your-spot-highest-rated-kedarkantha-trek-packages",
    "book-kedarkantha-trek-now-and-receive-surprise-perks",
    "ultimate-kedarkantha-trek-bundle-deals-just-for-you",
    "kedarkantha-trekking-essentials-buy-now-save-big",
)
