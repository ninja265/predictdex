# Crypto Withdrawal API Documentation

**Date:** December 10, 2024

---

## Overview

Users can now withdraw crypto (ETH, USDC, USDT) to any Ethereum address. The system includes comprehensive safeguards to prevent fraud and protect users.

---

## Endpoints

### 1. Request Withdrawal

```
POST /api/v1/crypto/withdraw
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "token": "ETH",
  "amount": 0.5,
  "destinationAddress": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "idempotencyKey": "optional-uuid-for-dedup"
}
```

**Response:**
```json
{
  "withdrawalId": "uuid",
  "token": "ETH",
  "amount": 0.5,
  "fee": 0.005,
  "netAmount": 0.495,
  "destinationAddress": "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "status": "pending",
  "message": "Withdrawal request submitted. Admin will process within 24 hours.",
  "newAvailableBalance": 1.5
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `Invalid Ethereum address format` | Address is not a valid Ethereum address |
| 400 | `Minimum withdrawal is X TOKEN` | Amount below minimum |
| 400 | `Maximum withdrawal is X TOKEN` | Amount above maximum |
| 400 | `New accounts must wait X more hours...` | Account is less than 24 hours old |
| 400 | `Daily limit exceeded...` | User has reached daily withdrawal limit |
| 400 | `Insufficient available balance. X is locked in active market positions...` | Funds are reserved in open trades |
| 400 | `Insufficient balance...` | Not enough funds at all |

---

### 2. Get Withdrawal History

```
GET /api/v1/crypto/withdrawals/history?limit=20&offset=0
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "withdrawals": [
    {
      "id": "uuid",
      "token": "ETH",
      "amount": 0.5,
      "fee": 0.005,
      "netAmount": 0.495,
      "destinationAddress": "0xAb58...",
      "status": "completed",
      "txHash": "0x123abc...",
      "rejectionReason": null,
      "createdAt": "2024-12-10T10:00:00.000Z",
      "processedAt": "2024-12-10T12:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

**Status Values:**
- `pending` - Awaiting admin review
- `approved` - Approved by admin, awaiting blockchain tx
- `completed` - Funds sent, txHash available
- `rejected` - Rejected by admin, funds returned

---

### 3. Get Withdrawal Limits

```
GET /api/v1/crypto/withdrawals/limits
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "feeRate": 0.01,
  "feePercentage": "1%",
  "limits": {
    "ETH": {
      "daily": 5,
      "used": 0.5,
      "remaining": 4.5,
      "min": 0.001,
      "max": 10
    },
    "USDC": {
      "daily": 5000,
      "used": 0,
      "remaining": 5000,
      "min": 5,
      "max": 10000
    },
    "USDT": {
      "daily": 5000,
      "used": 100,
      "remaining": 4900,
      "min": 5,
      "max": 10000
    }
  }
}
```

---

## Safeguards Implemented

### 1. Funds Protection
- **Only available balance can be withdrawn** - Reserved balance (locked in market positions) cannot be withdrawn
- **Clear error messages** - If funds are locked, user sees exactly how much is available vs reserved

### 2. Address Validation
- Ethereum address format validation using ethers.js
- Checksum validation for address integrity

### 3. Amount Limits
| Token | Minimum | Maximum | Daily Limit |
|-------|---------|---------|-------------|
| ETH | 0.001 | 10 | 5 ETH |
| USDC | 5 | 10,000 | 5,000 USDC |
| USDT | 5 | 10,000 | 5,000 USDT |

### 4. Account Age Requirement
- New accounts must wait **24 hours** before first crypto withdrawal
- Prevents immediate withdrawal after deposits (chargeback protection)

### 5. Withdrawal Fee
- **1% fee** on all crypto withdrawals
- Fee is deducted from the withdrawal amount
- `netAmount = amount - fee`

### 6. Idempotency
- Optional `idempotencyKey` prevents duplicate withdrawals from double-clicks

---

## Frontend Implementation Notes

### Decimal Precision Handling

The API returns amounts with up to **18 decimal places** for ETH (and 6 for USDC/USDT). Handle these carefully:

```tsx
// Use string parsing or BigNumber libraries for precision
// Avoid: parseFloat(amount) for large precision values
// Prefer: Keep as string for display, use BigNumber for calculations

// Example: Display ETH with 6 decimal places
const formatCrypto = (amount: number, token: string) => {
  const decimals = token === 'ETH' ? 6 : 2;
  return amount.toFixed(decimals);
};

// Example: Fee calculation (matches backend 1% fee)
const calculateFee = (amount: number) => amount * 0.01;
const calculateNet = (amount: number) => amount - calculateFee(amount);
```

### Withdrawal Form

```tsx
function WithdrawForm() {
  const [limits, setLimits] = useState(null);
  
  useEffect(() => {
    fetch('/api/v1/crypto/withdrawals/limits', { headers: authHeaders })
      .then(r => r.json())
      .then(setLimits);
  }, []);

  const calculateFee = (amount) => amount * 0.01;
  const calculateNet = (amount) => amount - calculateFee(amount);

  return (
    <form onSubmit={handleWithdraw}>
      <select name="token">
        <option value="ETH">ETH</option>
        <option value="USDC">USDC</option>
        <option value="USDT">USDT</option>
      </select>
      
      <input 
        name="amount" 
        type="number" 
        min={limits?.limits[token]?.min}
        max={Math.min(limits?.limits[token]?.max, limits?.limits[token]?.remaining)}
      />
      
      <input name="destinationAddress" placeholder="0x..." pattern="^0x[a-fA-F0-9]{40}$" />
      
      <p>Fee: {calculateFee(amount)} {token}</p>
      <p>You will receive: {calculateNet(amount)} {token}</p>
      <p>Daily remaining: {limits?.limits[token]?.remaining} {token}</p>
      
      <button type="submit">Withdraw</button>
    </form>
  );
}
```

### Display Reserved Balance Warning

```tsx
// When showing balance on withdrawal page
const { available, reserved } = balance;

{reserved > 0 && (
  <div className="warning">
    Note: {reserved} {token} is locked in active market positions
  </div>
)}
```

### Error Handling UX

Handle specific error messages to show appropriate UI:

```tsx
const handleWithdraw = async (data) => {
  try {
    const res = await fetch('/api/v1/crypto/withdraw', {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const error = await res.json();
      const message = error.message;
      
      // Handle specific errors with appropriate UI
      if (message.includes('Daily limit exceeded')) {
        showWarning('Daily Limit Reached', message);
      } else if (message.includes('locked in active market positions')) {
        showWarning('Funds Locked', message);
      } else if (message.includes('New accounts must wait')) {
        showWarning('Account Too New', message);
      } else if (message.includes('Invalid Ethereum address')) {
        showError('Invalid Address', 'Please enter a valid Ethereum address');
      } else {
        showError('Withdrawal Failed', message);
      }
      return;
    }
    
    const result = await res.json();
    showSuccess('Withdrawal Submitted', `${result.netAmount} ${result.token} will be sent to your wallet`);
  } catch (err) {
    showError('Network Error', 'Please try again');
  }
};
```

### Withdrawal Status Display

```tsx
const statusConfig = {
  pending: { color: 'yellow', label: 'Pending Review', icon: '⏳' },
  approved: { color: 'blue', label: 'Processing', icon: '🔄' },
  completed: { color: 'green', label: 'Completed', icon: '✅' },
  rejected: { color: 'red', label: 'Rejected', icon: '❌' },
};

// Show txHash link for completed withdrawals
{withdrawal.status === 'completed' && withdrawal.txHash && (
  <a href={`https://etherscan.io/tx/${withdrawal.txHash}`} target="_blank">
    View on Etherscan
  </a>
)}

// Show rejection reason
{withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
  <p className="text-red-500">Reason: {withdrawal.rejectionReason}</p>
)}
```

---

## Admin Panel (Existing)

Admin endpoints for processing withdrawals remain unchanged:
- `GET /api/v1/admin/crypto/withdrawals` - List all withdrawals
- `POST /api/v1/admin/crypto/withdrawals/:id/approve` - Approve
- `POST /api/v1/admin/crypto/withdrawals/:id/reject` - Reject (refunds user)
- `POST /api/v1/admin/crypto/withdrawals/:id/complete` - Mark completed with txHash
