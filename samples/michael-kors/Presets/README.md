# Presets Folder (STS-2.00)

## Overview
This folder controls how the shop behaves at checkout. It determines the shop type (free, PO, or Stripe) and which data fields are shown to the customer.

**If this folder is missing entirely, the shop defaults to a basic free shop with all checkout fields enabled.** This ensures backward compatibility with older Shuttle versions.

## Files

### ShopType.txt

Controls the checkout payment/submission model.

```
# Options: free, po, stripe
type: free
```

| Value | Behavior |
|-------|----------|
| `free` | No payment required. Customer submits order directly. **(Default)** |
| `po` | Customer must enter a PO number and upload a signed PO PDF file. |
| `stripe` | Stripe payment integration. **(Coming soon - not yet implemented)** |

### DataRequired.txt

Controls which sections appear on the checkout page. Each toggle is `true` or `false`.

```
address: true
details: true
extra_notes: true
shipping_handler: true
hotel_list: false
```

| Toggle | Controls | Default |
|--------|----------|---------|
| `address` | Shipping address fields (address, city, state, zip, country) | `true` |
| `details` | Contact detail fields (email, phone, company) | `true` |
| `extra_notes` | "Order Notes" text area | `true` |
| `shipping_handler` | Freight option selector (LR Paris vs own freight) | `true` |
| `hotel_list` | Hotel selection dropdown | `false` |

### Hotel List

When `hotel_list: true`, the checkout page shows a dropdown populated from:
```
DATABASE/Design/Details/Hotels.txt
```

Add one hotel per line. Lines starting with `#` are comments. Example:
```
The Plaza Hotel - 768 5th Ave, New York, NY 10019
Marriott Marquis - 1535 Broadway, New York, NY 10036
```

The selected hotel is stored in the `Hotel Selection` column of `orders.csv`.

## How It Works

1. On page load, the checkout page fetches `/api/presets`
2. The API reads `ShopType.txt` and `DataRequired.txt` from this folder
3. If files/folder are missing, defaults are returned (free shop, all fields on)
4. The checkout page conditionally renders sections based on the toggles
5. For PO shops, a PO number field and PDF upload appear
6. For Stripe shops, a placeholder message appears (not yet functional)

## API Endpoint

```
GET /api/presets
```

Returns:
```json
{
  "shopType": "free",
  "dataRequired": {
    "address": true,
    "details": true,
    "extra_notes": true,
    "shipping_handler": true,
    "hotel_list": false
  },
  "hotelList": []
}
```

## For AI Assistants

1. **Always default to `free`** if ShopType.txt is missing or has an invalid value
2. **Always default toggles to `true`** (except `hotel_list` which defaults to `false`) if DataRequired.txt is missing
3. The format is `key: value` — one per line, `#` lines are comments
4. Do not add new toggle keys without updating `lib/presets.ts` and the checkout page
5. Stripe is a placeholder — do not implement payment logic for it yet
