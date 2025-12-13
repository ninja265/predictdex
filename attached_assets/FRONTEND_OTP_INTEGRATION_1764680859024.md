# OTP Email Authentication Integration Guide

This guide explains how to integrate email OTP (One-Time Password) authentication into your frontend application.

## Base URL

```
https://sa-api-server-1.replit.app/api/v1
```

---

## Authentication Flow Overview

```
1. User enters email
2. Frontend calls POST /auth/request-otp
3. Backend sends 6-digit code to user's email
4. User enters the code
5. Frontend calls POST /auth/verify-otp
6. Backend returns JWT token
7. Frontend stores token and uses it for authenticated requests
```

---

## Endpoints

### 1. Request OTP Code

Sends a 6-digit verification code to the user's email.

```http
POST /api/v1/auth/request-otp
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Code sent to email",
  "expiresIn": 300
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation Error | Invalid email format |
| 429 | Too Many Requests | Rate limit exceeded (max 5 requests per 15 minutes) |

```json
{
  "success": false,
  "error": "Too many OTP requests. Please try again later."
}
```

---

### 2. Verify OTP Code

Validates the code and returns a JWT token for authentication.

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2025-12-09T12:00:00.000Z",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": null,
    "defaultCurrency": "ZAR",
    "balances": [
      {
        "currency": "ZAR",
        "available": 25000,
        "reserved": 0
      }
    ],
    "role": "user"
  }
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Invalid or expired code | Code doesn't match or has expired |
| 401 | Too many failed attempts | Max 5 attempts per code |

```json
{
  "success": false,
  "error": "Invalid or expired code"
}
```

---

## React Integration Example

### API Client Setup

```typescript
// lib/api.ts
import axios from 'axios';

const API_BASE_URL = 'https://sa-api-server-1.replit.app/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Auth Functions

```typescript
// lib/auth.ts
import { api } from './api';

export interface User {
  id: string;
  email: string;
  name: string | null;
  defaultCurrency: string;
  balances: Array<{
    currency: string;
    available: number;
    reserved: number;
  }>;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  expiresAt: string;
  user: User;
}

export const requestOtp = async (email: string) => {
  const response = await api.post('/auth/request-otp', { email });
  return response.data;
};

export const verifyOtp = async (email: string, code: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/verify-otp', { email, code });
  
  // Store the token
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('authToken');
  window.location.href = '/login';
};

export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

export const isAuthenticated = () => {
  return !!getStoredToken();
};
```

### Login Component

```tsx
// components/LoginForm.tsx
import { useState } from 'react';
import { requestOtp, verifyOtp } from '../lib/auth';

type Step = 'email' | 'otp';

export function LoginForm({ onSuccess }: { onSuccess: (user: any) => void }) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await requestOtp(email);
      if (result.success) {
        setStep('otp');
        // Start countdown for resend button
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp(email, code);
      if (result.success) {
        onSuccess(result.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      await requestOtp(email);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <form onSubmit={handleRequestOtp}>
        <h2>Sign In</h2>
        <p>Enter your email to receive a verification code</p>
        
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={loading}
        />
        
        {error && <p className="error">{error}</p>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp}>
      <h2>Enter Code</h2>
      <p>We sent a 6-digit code to {email}</p>
      
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        maxLength={6}
        pattern="[0-9]{6}"
        required
        disabled={loading}
        autoFocus
      />
      
      {error && <p className="error">{error}</p>}
      
      <button type="submit" disabled={loading || code.length !== 6}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      
      <button
        type="button"
        onClick={handleResendCode}
        disabled={countdown > 0 || loading}
      >
        {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
      </button>
      
      <button type="button" onClick={() => setStep('email')}>
        Change Email
      </button>
    </form>
  );
}
```

### React Query Hook (Optional)

```typescript
// hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { requestOtp, verifyOtp } from '../lib/auth';

export function useRequestOtp() {
  return useMutation({
    mutationFn: (email: string) => requestOtp(email),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => 
      verifyOtp(email, code),
  });
}
```

---

## Important Notes

### Code Expiration
- OTP codes expire after **5 minutes**
- Each code can only be used once
- Maximum **5 failed attempts** per code

### Rate Limiting
- Maximum **5 OTP requests** per email per 15 minutes
- If rate limited, show countdown to user

### Token Storage
- Store JWT token in `localStorage` for persistence
- Token expires after **7 days**
- Include token in `Authorization: Bearer <token>` header for all authenticated requests

### New User Registration
- If the email doesn't exist, a new account is automatically created
- New users receive a default balance of R25,000 (ZAR)

### Email Delivery
- Emails are sent via Resend
- Check spam folder if not received
- OTP emails have subject: "Your Africa Predicts verification code: XXXXXX"

---

## Testing

Use these test endpoints to verify integration:

```bash
# Request OTP
curl -X POST https://sa-api-server-1.replit.app/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'

# Verify OTP (use code from email)
curl -X POST https://sa-api-server-1.replit.app/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "code": "123456"}'

# Get current user (authenticated)
curl https://sa-api-server-1.replit.app/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Handling Best Practices

```typescript
try {
  await requestOtp(email);
} catch (error) {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 400:
        // Invalid email format
        setError('Please enter a valid email address');
        break;
      case 429:
        // Rate limited
        setError('Too many requests. Please wait a few minutes.');
        break;
      default:
        setError('Something went wrong. Please try again.');
    }
  }
}
```

---

## Questions?

Refer to the full API documentation in `API_DOCUMENTATION.md` or contact the backend team.
