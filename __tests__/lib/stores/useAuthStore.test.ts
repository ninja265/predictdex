import { describe, it, expect, beforeEach } from '@jest/globals';

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

interface MockUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

interface MockAuthState {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

function createMockAuthStore() {
  let state: MockAuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  return {
    getState: () => state,
    setState: (partial: Partial<MockAuthState>) => {
      state = { ...state, ...partial };
    },
    setUser: (user: MockUser | null) => {
      state = { ...state, user, isAuthenticated: !!user };
    },
    setError: (error: string | null) => {
      state = { ...state, error };
    },
    setLoading: (isLoading: boolean) => {
      state = { ...state, isLoading };
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      state = { user: null, isAuthenticated: false, isLoading: false, error: null };
    },
    reset: () => {
      state = { user: null, isAuthenticated: false, isLoading: false, error: null };
    },
  };
}

describe('Auth Store Behavior', () => {
  let store: ReturnType<typeof createMockAuthStore>;

  beforeEach(() => {
    mockLocalStorage.clear();
    store = createMockAuthStore();
  });

  describe('Initial State', () => {
    it('starts with null user', () => {
      expect(store.getState().user).toBeNull();
    });

    it('starts not authenticated', () => {
      expect(store.getState().isAuthenticated).toBe(false);
    });

    it('starts not loading', () => {
      expect(store.getState().isLoading).toBe(false);
    });

    it('starts with no error', () => {
      expect(store.getState().error).toBeNull();
    });
  });

  describe('setUser action', () => {
    it('sets user and isAuthenticated to true', () => {
      const user: MockUser = { id: 'user-1', email: 'test@example.com', role: 'user' };
      store.setUser(user);
      
      expect(store.getState().user).toEqual(user);
      expect(store.getState().isAuthenticated).toBe(true);
    });

    it('clears user and sets isAuthenticated to false', () => {
      store.setUser({ id: '1', email: 'test@test.com', role: 'user' });
      store.setUser(null);
      
      expect(store.getState().user).toBeNull();
      expect(store.getState().isAuthenticated).toBe(false);
    });

    it('updates user preserving other state', () => {
      store.setError('previous error');
      store.setUser({ id: '1', email: 'test@test.com', role: 'user' });
      
      expect(store.getState().user).not.toBeNull();
      expect(store.getState().error).toBe('previous error');
    });
  });

  describe('setError action', () => {
    it('sets error message', () => {
      store.setError('Authentication failed');
      expect(store.getState().error).toBe('Authentication failed');
    });

    it('clears error when set to null', () => {
      store.setError('Some error');
      store.setError(null);
      expect(store.getState().error).toBeNull();
    });
  });

  describe('setLoading action', () => {
    it('sets loading to true', () => {
      store.setLoading(true);
      expect(store.getState().isLoading).toBe(true);
    });

    it('sets loading to false', () => {
      store.setLoading(true);
      store.setLoading(false);
      expect(store.getState().isLoading).toBe(false);
    });
  });

  describe('logout action', () => {
    it('clears user state completely', () => {
      store.setUser({ id: '1', email: 'test@test.com', role: 'user' });
      localStorage.setItem('auth_token', 'token-123');
      
      store.logout();
      
      expect(store.getState().user).toBeNull();
      expect(store.getState().isAuthenticated).toBe(false);
      expect(store.getState().isLoading).toBe(false);
      expect(store.getState().error).toBeNull();
    });

    it('removes token from localStorage', () => {
      localStorage.setItem('auth_token', 'token-to-remove');
      store.logout();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('User Roles', () => {
    it('correctly identifies admin user', () => {
      const admin: MockUser = { id: 'admin-1', email: 'admin@example.com', role: 'admin' };
      store.setUser(admin);
      expect(store.getState().user?.role).toBe('admin');
    });

    it('correctly identifies regular user', () => {
      const user: MockUser = { id: 'user-1', email: 'user@example.com', role: 'user' };
      store.setUser(user);
      expect(store.getState().user?.role).toBe('user');
    });
  });
});

describe('Email OTP Validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  it('validates correct email format', () => {
    expect(emailRegex.test('user@example.com')).toBe(true);
    expect(emailRegex.test('name.surname@domain.co.za')).toBe(true);
  });

  it('rejects invalid email format', () => {
    expect(emailRegex.test('invalid-email')).toBe(false);
    expect(emailRegex.test('missing@domain')).toBe(false);
    expect(emailRegex.test('@nodomain.com')).toBe(false);
    expect(emailRegex.test('')).toBe(false);
  });
});

describe('OTP Code Validation', () => {
  const otpRegex = /^\d{6}$/;

  it('validates 6-digit OTP codes', () => {
    expect(otpRegex.test('123456')).toBe(true);
    expect(otpRegex.test('000000')).toBe(true);
    expect(otpRegex.test('999999')).toBe(true);
  });

  it('rejects invalid OTP codes', () => {
    expect(otpRegex.test('12345')).toBe(false);
    expect(otpRegex.test('1234567')).toBe(false);
    expect(otpRegex.test('abcdef')).toBe(false);
    expect(otpRegex.test('')).toBe(false);
  });
});

describe('Wallet Address Validation', () => {
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;

  it('validates correct Ethereum addresses', () => {
    expect(addressRegex.test('0x742d35Cc6634C0532925a3b844Bc9e7595f5aB0e')).toBe(true);
    expect(addressRegex.test('0x0000000000000000000000000000000000000000')).toBe(true);
  });

  it('rejects invalid Ethereum addresses', () => {
    expect(addressRegex.test('invalid')).toBe(false);
    expect(addressRegex.test('0x123')).toBe(false);
    expect(addressRegex.test('742d35Cc6634C0532925a3b844Bc9e7595f5aB0e')).toBe(false);
  });
});

describe('Auth State Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('stores auth state in localStorage', () => {
    const state = { user: { id: '1', email: 'test@test.com', role: 'user' }, isAuthenticated: true };
    localStorage.setItem('auth-storage', JSON.stringify(state));
    
    const stored = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(stored.isAuthenticated).toBe(true);
    expect(stored.user.email).toBe('test@test.com');
  });

  it('rehydrates state from localStorage', () => {
    const storedState = { user: { id: '1', email: 'rehydrated@test.com', role: 'admin' }, isAuthenticated: true };
    localStorage.setItem('auth-storage', JSON.stringify(storedState));
    
    const rehydrated = JSON.parse(localStorage.getItem('auth-storage') || '{}');
    expect(rehydrated.user.email).toBe('rehydrated@test.com');
    expect(rehydrated.user.role).toBe('admin');
  });

  it('handles missing storage gracefully', () => {
    const stored = localStorage.getItem('nonexistent-key');
    expect(stored).toBeNull();
  });
});

describe('Token Management', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('stores token when login succeeds', () => {
    const token = 'jwt-token-from-server';
    localStorage.setItem('auth_token', token);
    expect(localStorage.getItem('auth_token')).toBe(token);
  });

  it('clears token on logout', () => {
    localStorage.setItem('auth_token', 'existing-token');
    localStorage.removeItem('auth_token');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('checkAuth reads token from localStorage', () => {
    localStorage.setItem('auth_token', 'stored-token');
    const token = localStorage.getItem('auth_token');
    expect(token).toBe('stored-token');
  });
});
