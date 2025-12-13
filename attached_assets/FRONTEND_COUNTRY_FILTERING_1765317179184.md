# Country Filtering Feature - Frontend Integration Guide

**Date:** December 2024  
**Feature:** Geographic filtering for markets by African country

---

## Overview

Markets can now be tagged with a country and filtered by geography. This enables features like "Markets in South Africa" or "Nigerian Politics" sections in the frontend.

---

## New Endpoint: List Countries

```
GET /api/v1/markets/countries
```

Returns all 20 supported African countries. Use this to populate country dropdowns, filters, or navigation.

**Response:**
```json
{
  "countries": [
    {
      "code": "ZA",
      "name": "South Africa",
      "slug": "south-africa",
      "region": "Southern Africa",
      "flagEmoji": "🇿🇦"
    },
    {
      "code": "NG",
      "name": "Nigeria",
      "slug": "nigeria",
      "region": "West Africa",
      "flagEmoji": "🇳🇬"
    }
  ]
}
```

**Supported Countries:**
| Code | Name | Slug | Region |
|------|------|------|--------|
| DZ | Algeria | algeria | North Africa |
| AO | Angola | angola | Southern Africa |
| BW | Botswana | botswana | Southern Africa |
| CM | Cameroon | cameroon | Central Africa |
| CI | Côte d'Ivoire | cote-divoire | West Africa |
| EG | Egypt | egypt | North Africa |
| ET | Ethiopia | ethiopia | East Africa |
| GH | Ghana | ghana | West Africa |
| KE | Kenya | kenya | East Africa |
| MA | Morocco | morocco | North Africa |
| MZ | Mozambique | mozambique | Southern Africa |
| NA | Namibia | namibia | Southern Africa |
| NG | Nigeria | nigeria | West Africa |
| RW | Rwanda | rwanda | East Africa |
| SN | Senegal | senegal | West Africa |
| ZA | South Africa | south-africa | Southern Africa |
| TZ | Tanzania | tanzania | East Africa |
| TN | Tunisia | tunisia | North Africa |
| UG | Uganda | uganda | East Africa |
| ZM | Zambia | zambia | Southern Africa |

---

## Filtering Markets by Country

```
GET /api/v1/markets?country=ZA
GET /api/v1/markets?country=south-africa
```

Both country code and slug work. Case-insensitive.

**Combined filters:**
```
GET /api/v1/markets?country=ZA&category=Politics&status=open
```

**Behavior for invalid country:**
- Returns empty result set: `{"markets":[], "total":0}`
- Does NOT return all markets

---

## Market Response Changes

All market responses now include country info when assigned:

```json
{
  "id": "uuid-here",
  "slug": "will-cyril-complete-term",
  "question": "Will Cyril complete his term?",
  "category": "Politics",
  "currency": "ZAR",
  "symbol": "R",
  "countryCode": "ZA",
  "country": {
    "code": "ZA",
    "name": "South Africa",
    "slug": "south-africa",
    "flagEmoji": "🇿🇦"
  },
  "yesPrice": 0.65,
  "noPrice": 0.35,
  "volume": 50000,
  "closesAt": "2026-12-31T23:59:59.000Z"
}
```

If no country assigned: `countryCode: null, country: null`

---

## Admin: Assigning Country to Markets

When creating or updating markets via admin endpoints:

**Create:**
```json
POST /api/v1/admin/markets
{
  "slug": "will-tinubu-win-2027",
  "question": "Will Tinubu win the 2027 election?",
  "category": "Politics",
  "currency": "NGN",
  "countryCode": "NG",
  "closesAt": "2027-02-28T23:59:59Z"
}
```

**Update:**
```json
PATCH /api/v1/admin/markets/:id
{
  "countryCode": "NG"
}
```

Invalid country codes return `400 Bad Request`.

---

## UI Suggestions

1. **Country filter dropdown** - Use `/markets/countries` to populate
2. **Flag display** - Use `flagEmoji` field for visual indicators
3. **Regional grouping** - Group countries by `region` field
4. **URL routing** - Use slugs for SEO-friendly URLs: `/markets/south-africa`

---

## Caching

- Countries list: Cached for 1 hour (rarely changes)
- Market list with country filter: Cached for 30 seconds

---

## Questions?

The Swagger docs at `/api/v1` have been updated with all new parameters.
