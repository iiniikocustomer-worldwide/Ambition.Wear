# Ambition.co

Streetwear Drop & Sneakers

## Website

The repository includes a responsive storefront in `index.html`. Product listings are rendered from `stock.json` so the latest stock can be updated without changing the page.

### Add stock

Add products to `stock.json` as a JSON array. Supported fields:

- `name` (required): product name
- `category`: e.g. Sneakers, Streetwear
- `size`: available size(s)
- `price`: displayed price or price note
- `status`: stock label (defaults to “In stock”)
- `image`: image URL or repository-relative path
- `mark`: short visual fallback when no image is supplied

Example structure (replace with actual group listings):

```json
[
  {
    "name": "Product name",
    "category": "Sneakers",
    "size": "UK 8",
    "price": "R 1,200",
    "status": "In stock",
    "image": "images/product.jpg"
  }
]
```

The WhatsApp group is linked from the storefront for live stock and drop updates. Group messages are not automatically imported; add only verified listings to `stock.json`.
