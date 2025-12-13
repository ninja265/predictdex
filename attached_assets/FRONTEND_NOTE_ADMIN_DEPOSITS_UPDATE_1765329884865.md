# Frontend Team Note: Admin Deposits API Update

**Date:** December 10, 2024  
**Priority:** Medium  
**Affects:** Admin Crypto Panel (`/admin/crypto`)

---

## Summary

The admin deposits endpoint has been updated with new fields to improve the Crypto Management panel display.

---

## New Fields Added

### In Each Deposit Object

| Field | Type | Description |
|-------|------|-------------|
| `requiredConfirmations` | `number` | Required confirmations (3 testnet, 12 mainnet) |
| `isThresholdMet` | `boolean` | `true` when `confirmations >= requiredConfirmations` |

### User Object Improvements

- `user.email` - Now returns `null` instead of `undefined` when not set
- `user.walletAddress` - Now returns `null` instead of `undefined` when not set

---

## Response Example

```json
{
  "deposits": [
    {
      "id": "uuid",
      "txHash": "0xc650dc9a...",
      "token": "ETH",
      "amount": 0.001,
      "confirmations": 2,
      "requiredConfirmations": 3,
      "isThresholdMet": false,
      "status": "pending",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "walletAddress": null
      }
    }
  ],
  "requiredConfirmations": 3
}
```

---

## Recommended UI Updates

### 1. Confirmation Display
**Before:** `0/ confirmations`  
**After:** `2/3 confirmations`

```tsx
<span>{deposit.confirmations}/{deposit.requiredConfirmations} confirmations</span>
```

### 2. User Display
**Before:** `User: Unknown`  
**After:** Shows email or wallet address

```tsx
<span>
  User: {deposit.user.email || deposit.user.walletAddress || 'Unknown'}
</span>
```

### 3. Credit Button Logic (Optional Enhancement)

```tsx
{deposit.isThresholdMet && deposit.status === 'pending' && (
  <button onClick={() => creditDeposit(deposit.id)}>
    CREDIT
  </button>
)}
```

---

## Testing Checklist

- [ ] Confirmation count displays correctly (e.g., "2/3")
- [ ] User email or wallet address displays (not "Unknown")
- [ ] Credit button appears when `isThresholdMet` is true
- [ ] Credited deposits show final confirmation count

---

## Endpoints Affected

- `GET /api/v1/admin/crypto/deposits` - List deposits
- `GET /api/v1/admin/crypto/deposits/:id` - Single deposit detail

---

## Questions?

API documentation: `/api/v1` (Swagger UI)
