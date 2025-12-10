# Crypto Funding Integration Guide - Frontend

**Date:** December 2024  
**For:** Frontend Team  
**Feature:** Cryptocurrency deposits (ETH, USDC, USDT) on Ethereum Sepolia Testnet

---

## Overview

Users can deposit cryptocurrency to fund their accounts. The system generates unique HD-derived deposit addresses per user/token, monitors the blockchain for incoming transactions, and automatically credits balances after confirmations.

---

## Public Endpoints (No Auth Required)

### Get Supported Tokens
```
GET /api/v1/crypto/tokens
```

**Response:**
```json
{
  "network": "Ethereum Sepolia Testnet",
  "isTestnet": true,
  "requiredConfirmations": 3,
  "tokens": [
    { "token": "ETH", "name": "Ethereum", "decimals": 18, "contractAddress": null },
    { "token": "USDC", "name": "USDC", "decimals": 6, "contractAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" },
    { "token": "USDT", "name": "USDT", "decimals": 6, "contractAddress": "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06" }
  ]
}
```

---

## User Endpoints (Auth Required)

### Get Deposit Address for a Token
```
GET /api/v1/crypto/deposit-address/:token
Authorization: Bearer <token>
```

**Example:** `GET /api/v1/crypto/deposit-address/ETH`

**Response:**
```json
{
  "token": "ETH",
  "address": "0xb4D20487145C4A592127FAF2cE6d97d4C17813df",
  "network": "Ethereum Sepolia Testnet",
  "isTestnet": true,
  "requiredConfirmations": 3,
  "minDeposit": "0.001",
  "warning": "Only send ETH on the Ethereum Sepolia network. Sending other tokens or using wrong network will result in permanent loss."
}
```

### Get All Deposit Addresses
```
GET /api/v1/crypto/deposit-addresses
Authorization: Bearer <token>
```

**Response:**
```json
{
  "network": "Ethereum Sepolia Testnet",
  "isTestnet": true,
  "addresses": [
    { "token": "ETH", "address": "0xb4D20487145C4A592127FAF2cE6d97d4C17813df" },
    { "token": "USDC", "address": "0x3A7cdede417D975da4fCed55223962aec5B79E02" },
    { "token": "USDT", "address": "0xb584c2FC41414ea46c965b19783650737C51ec59" }
  ]
}
```

### Get Pending Deposits
```
GET /api/v1/crypto/deposits/pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deposits": [
    {
      "id": "uuid",
      "token": "ETH",
      "amount": "0.001",
      "txHash": "0xc650dc9af6d5ebc30ecdd48e35cdb3e2e55029e7ce287ac2b688b957dacb4f03",
      "status": "pending",
      "confirmations": 2,
      "requiredConfirmations": 3,
      "blockNumber": 9806207,
      "createdAt": "2025-12-10T00:50:29.052Z"
    }
  ]
}
```

### Get Deposit History
```
GET /api/v1/crypto/deposits/history?limit=20&offset=0
Authorization: Bearer <token>
```

**Response:**
```json
{
  "deposits": [
    {
      "id": "uuid",
      "token": "ETH",
      "amount": "0.001",
      "txHash": "0xc650dc9a...",
      "status": "credited",
      "confirmations": 12,
      "creditedAt": "2025-12-10T01:05:00.000Z",
      "createdAt": "2025-12-10T00:50:29.052Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

---

## Deposit Status Flow

```
pending → credited
   ↓
 (if issue)
   ↓
rejected/failed
```

| Status | Description |
|--------|-------------|
| `pending` | Transaction detected, waiting for confirmations |
| `credited` | Confirmations complete, balance credited |
| `rejected` | Admin rejected (manual review cases) |
| `failed` | Transaction failed or reverted |

---

## Frontend Implementation

### 1. Deposit Tab Component

```tsx
// components/wallet/DepositTab.tsx
import { useState, useEffect } from 'react';

export function DepositTab() {
  const [tokens, setTokens] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [selectedToken, setSelectedToken] = useState('ETH');

  useEffect(() => {
    // Fetch supported tokens
    fetch('/api/v1/crypto/tokens')
      .then(r => r.json())
      .then(data => setTokens(data.tokens));
    
    // Fetch user's deposit addresses (auth required)
    fetch('/api/v1/crypto/deposit-addresses', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setAddresses(data.addresses));
    
    // Fetch pending deposits
    fetchPendingDeposits();
  }, []);

  const fetchPendingDeposits = () => {
    fetch('/api/v1/crypto/deposits/pending', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setPendingDeposits(data.deposits));
  };

  // Poll for pending deposit updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPendingDeposits, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentAddress = addresses.find(a => a.token === selectedToken);

  return (
    <div>
      <h2>Deposit Cryptocurrency</h2>
      
      {/* Token Selector */}
      <div className="token-tabs">
        {tokens.map(t => (
          <button 
            key={t.token}
            className={selectedToken === t.token ? 'active' : ''}
            onClick={() => setSelectedToken(t.token)}
          >
            {t.token}
          </button>
        ))}
      </div>

      {/* Deposit Address */}
      {currentAddress && (
        <div className="deposit-address">
          <p>Send {selectedToken} to this address:</p>
          <div className="address-box">
            <code>{currentAddress.address}</code>
            <button onClick={() => navigator.clipboard.writeText(currentAddress.address)}>
              Copy
            </button>
          </div>
          <QRCode value={currentAddress.address} />
          <p className="warning">
            Only send {selectedToken} on Ethereum Sepolia network.
          </p>
        </div>
      )}

      {/* Pending Deposits */}
      {pendingDeposits.length > 0 && (
        <div className="pending-deposits">
          <h3>Pending Deposits</h3>
          {pendingDeposits.map(d => (
            <div key={d.id} className="deposit-item">
              <span>{d.amount} {d.token}</span>
              <span>{d.confirmations}/{d.requiredConfirmations} confirmations</span>
              <a href={`https://sepolia.etherscan.io/tx/${d.txHash}`} target="_blank">
                View on Etherscan
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. Balance Display with Crypto

```tsx
// Show crypto balances alongside fiat
const cryptoBalances = balances.filter(b => 
  ['ETH', 'USDC', 'USDT'].includes(b.currency)
);

{cryptoBalances.map(b => (
  <div key={b.currency} className="balance-card">
    <span className="currency">{b.currency}</span>
    <span className="amount">{b.available}</span>
    {b.reserved > 0 && (
      <span className="reserved">({b.reserved} in trades)</span>
    )}
  </div>
))}
```

---

## Admin Endpoints

### Get All Deposits (Admin)
```
GET /api/v1/admin/crypto/deposits?status=pending&limit=20
Authorization: Bearer <admin-token>
```

### Get Crypto Stats (Admin)
```
GET /api/v1/admin/crypto/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "deposits": {
    "pending": { "count": 1, "totalETH": "0.001", "totalUSDC": "0", "totalUSDT": "0" },
    "credited": { "count": 5, "totalETH": "0.5", "totalUSDC": "100", "totalUSDT": "50" }
  },
  "withdrawals": {
    "pending": { "count": 0 },
    "approved": { "count": 2 }
  }
}
```

### Manual Credit Deposit (Admin)
```
POST /api/v1/admin/crypto/deposits/:id/credit
Authorization: Bearer <admin-token>
```

---

## Important Notes

1. **Testnet Mode:** Currently on Ethereum Sepolia testnet. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/).

2. **Confirmations:** 3 confirmations required on testnet, 12 on mainnet.

3. **Polling:** Frontend should poll `/deposits/pending` every 30 seconds to show confirmation progress.

4. **Min Deposits:**
   - ETH: 0.001 ETH (~$3.50)
   - USDC: 5 USDC ($5.00)
   - USDT: 5 USDT ($5.00)

5. **Addresses are unique per user/token.** Each user gets 3 addresses (one per token) derived from the platform's HD wallet.

6. **Auto-credit:** Once confirmations are reached, the balance is automatically credited. No manual action needed.

---

## Testing Checklist

- [ ] Tokens endpoint returns all 3 supported tokens
- [ ] Deposit address generates correctly for each token
- [ ] QR code displays for address
- [ ] Copy button works
- [ ] Pending deposits show with confirmation count
- [ ] Etherscan link works
- [ ] Deposit history shows credited deposits
- [ ] Balance updates after deposit is credited
- [ ] Admin can view all deposits
- [ ] Admin can manually credit stuck deposits

---

## Questions?

Backend API documentation: `/api/v1` (Swagger UI)
