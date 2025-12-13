# Frontend Integration: Country Selector for Create/Edit Market

**Date:** December 2024  
**For:** Next.js Frontend Team  
**Feature:** Add country dropdown to admin market forms

---

## Overview

The backend now supports geographic tagging for markets. This guide shows how to add a country selector dropdown to the "Create New Market" and "Edit Market" admin forms.

---

## API Endpoints

### Get Countries List
```
GET /api/v1/markets/countries
```

**Response:**
```json
{
  "countries": [
    { "code": "ZA", "name": "South Africa", "slug": "south-africa", "region": "Southern Africa", "flagEmoji": "🇿🇦" },
    { "code": "NG", "name": "Nigeria", "slug": "nigeria", "region": "West Africa", "flagEmoji": "🇳🇬" },
    { "code": "KE", "name": "Kenya", "slug": "kenya", "region": "East Africa", "flagEmoji": "🇰🇪" }
  ]
}
```

### Create Market (with country)
```
POST /api/v1/admin/markets
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Will the ANC win the 2029 election?",
  "slug": "anc-2029-election",
  "description": "Resolution criteria...",
  "category": "Politics",
  "currency": "ZAR",
  "countryCode": "ZA",          // <-- NEW FIELD (optional)
  "closesAt": "2029-05-01T00:00:00Z",
  "yesPrice": 0.5,
  "noPrice": 0.5
}
```

### Update Market (add/change country)
```
PATCH /api/v1/admin/markets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "countryCode": "NG"
}
```

---

## React Implementation

### 1. Create Countries Hook

```typescript
// hooks/useCountries.ts
import { useState, useEffect } from 'react';

interface Country {
  code: string;
  name: string;
  slug: string;
  region: string;
  flagEmoji: string;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/markets/countries`)
      .then(res => res.json())
      .then(data => {
        setCountries(data.countries);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { countries, loading };
}
```

### 2. Country Selector Component

```typescript
// components/admin/CountrySelector.tsx
import { useCountries } from '@/hooks/useCountries';

interface Props {
  value: string;
  onChange: (code: string) => void;
  required?: boolean;
}

export function CountrySelector({ value, onChange, required = false }: Props) {
  const { countries, loading } = useCountries();

  // Group countries by region for better UX
  const regions = countries.reduce((acc, country) => {
    const region = country.region || 'Other';
    if (!acc[region]) acc[region] = [];
    acc[region].push(country);
    return acc;
  }, {} as Record<string, typeof countries>);

  if (loading) {
    return (
      <div className="form-group">
        <label>COUNTRY</label>
        <select disabled>
          <option>Loading countries...</option>
        </select>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label>
        COUNTRY {!required && <span className="optional">(Optional)</span>}
      </label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">— Select Country —</option>
        {Object.entries(regions).map(([region, regionCountries]) => (
          <optgroup key={region} label={region}>
            {regionCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flagEmoji} {country.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
```

### 3. Update Create Market Form

```typescript
// components/admin/CreateMarketModal.tsx
import { useState } from 'react';
import { CountrySelector } from './CountrySelector';

export function CreateMarketModal({ onClose, onSuccess }) {
  const [question, setQuestion] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Politics');
  const [currency, setCurrency] = useState('ZAR');
  const [countryCode, setCountryCode] = useState('');  // <-- ADD THIS
  const [closesAt, setClosesAt] = useState('');
  const [yesPrice, setYesPrice] = useState(0.5);
  const [noPrice, setNoPrice] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/markets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            question,
            slug,
            description: description || undefined,
            category,
            currency,
            countryCode: countryCode || undefined,  // <-- INCLUDE THIS
            closesAt: new Date(closesAt).toISOString(),
            yesPrice,
            noPrice,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create market');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New Market</h2>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Existing fields... */}
          <div className="form-group">
            <label>QUESTION</label>
            <input value={question} onChange={e => setQuestion(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>SLUG</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>DESCRIPTION</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CATEGORY</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Politics">Politics</option>
                <option value="Sports">Sports</option>
                <option value="Culture">Culture</option>
                <option value="Civics">Civics</option>
              </select>
            </div>

            <div className="form-group">
              <label>CURRENCY</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="ZAR">ZAR (R)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="KES">KES (KSh)</option>
                <option value="GHS">GHS (GH₵)</option>
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>

          {/* ADD COUNTRY SELECTOR HERE */}
          <CountrySelector 
            value={countryCode} 
            onChange={setCountryCode} 
          />

          <div className="form-group">
            <label>CLOSES AT</label>
            <input 
              type="datetime-local" 
              value={closesAt} 
              onChange={e => setClosesAt(e.target.value)} 
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>INITIAL YES PRICE</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                max="0.99"
                value={yesPrice} 
                onChange={e => setYesPrice(parseFloat(e.target.value))} 
              />
            </div>

            <div className="form-group">
              <label>INITIAL NO PRICE</label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                max="0.99"
                value={noPrice} 
                onChange={e => setNoPrice(parseFloat(e.target.value))} 
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'CREATE MARKET'}
            </button>
            <button type="button" onClick={onClose}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## Styling Suggestions

```css
/* Country selector with flag emojis */
.form-group select optgroup {
  font-weight: bold;
  color: #666;
}

.form-group select option {
  padding: 8px;
}

/* Optional label styling */
.optional {
  font-size: 0.8em;
  color: #888;
  font-weight: normal;
}
```

---

## UI Layout Suggestion

Based on the current form design, add the Country selector between Currency and Closes At:

```
┌─────────────────────────────────────┐
│ QUESTION                            │
│ [____________________________]      │
│                                     │
│ SLUG                                │
│ [____________________________]      │
│                                     │
│ DESCRIPTION                         │
│ [____________________________]      │
│                                     │
│ CATEGORY          CURRENCY          │
│ [Culture  ▼]      [USDC  ▼]        │
│                                     │
│ COUNTRY (Optional)                  │ <-- NEW
│ [🇿🇦 South Africa ▼]              │ <-- NEW
│                                     │
│ CLOSES AT                           │
│ [mm/dd/yyyy, --:-- --]              │
│                                     │
│ INITIAL YES PRICE  INITIAL NO PRICE │
│ [0.5]              [0.5]            │
│                                     │
│ [CREATE MARKET]    [CANCEL]         │
└─────────────────────────────────────┘
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| countryCode | Optional, must be valid ISO 3166-1 alpha-2 code |
| Invalid code | Returns `400 Bad Request` with message |

**Valid Codes:** DZ, AO, BW, CM, CI, EG, ET, GH, KE, MA, MZ, NA, NG, RW, SN, ZA, TZ, TN, UG, ZM

---

## Auto-Select Country by Currency (Optional UX Enhancement)

```typescript
// Suggest country based on currency selection
const currencyToCountry: Record<string, string> = {
  ZAR: 'ZA',
  NGN: 'NG',
  KES: 'KE',
  GHS: 'GH',
  EGP: 'EG',
  TZS: 'TZ',
  UGX: 'UG',
  ZMW: 'ZM',
  MAD: 'MA',
};

// When currency changes, suggest the country
const handleCurrencyChange = (newCurrency: string) => {
  setCurrency(newCurrency);
  const suggestedCountry = currencyToCountry[newCurrency];
  if (suggestedCountry && !countryCode) {
    setCountryCode(suggestedCountry);
  }
};
```

---

## Edit Market Form

For the edit market form, pre-populate the country selector with the market's current `countryCode`:

```typescript
// When loading market for edit
const market = await fetchMarket(marketId);
setCountryCode(market.countryCode || '');
```

---

## Testing Checklist

- [ ] Country dropdown populates with all 20 African countries
- [ ] Countries are grouped by region
- [ ] Flag emojis display correctly
- [ ] Selecting a country includes it in the create request
- [ ] Leaving country blank creates market without country
- [ ] Edit form shows existing country selection
- [ ] Invalid country code shows error message
- [ ] Country filter on market list works after creation

---

## Questions?

Backend API documentation available at: `/api/v1` (Swagger UI)
