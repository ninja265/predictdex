export function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function formatCurrency(amount: number, symbol: string): string {
  if (symbol === 'ETH') {
    return `${amount.toFixed(4)} ETH`;
  }
  if (symbol === 'USDC' || symbol === 'USDT') {
    return `${amount.toFixed(2)} ${symbol}`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCryptoAmount(amount: number, symbol: string): string {
  if (symbol === 'ETH') {
    if (amount === 0) return '0 ETH';
    if (Math.abs(amount) < 0.0001) {
      const formatted = amount.toFixed(8);
      const trimmed = formatted.replace(/0+$/, '').replace(/\.$/, '');
      return `${trimmed || '0'} ETH`;
    }
    if (Math.abs(amount) < 1) {
      const formatted = amount.toFixed(6);
      const trimmed = formatted.replace(/0+$/, '').replace(/\.$/, '');
      return `${trimmed || '0'} ETH`;
    }
    return `${amount.toFixed(4)} ETH`;
  }
  if (symbol === 'USDC' || symbol === 'USDT') {
    if (amount === 0) return `0 ${symbol}`;
    if (Math.abs(amount) < 0.01) {
      const formatted = amount.toFixed(6);
      const trimmed = formatted.replace(/0+$/, '').replace(/\.$/, '');
      return `${trimmed || '0'} ${symbol}`;
    }
    return `${amount.toFixed(2)} ${symbol}`;
  }
  return `${amount} ${symbol}`;
}

export function getExplorerTxUrl(txHash: string, network: string = 'sepolia'): string {
  const explorers: Record<string, string> = {
    sepolia: 'https://sepolia.etherscan.io/tx/',
    ethereum: 'https://etherscan.io/tx/',
    polygon: 'https://polygonscan.com/tx/',
    arbitrum: 'https://arbiscan.io/tx/',
    bsc: 'https://bscscan.com/tx/',
  };
  return `${explorers[network] || explorers.sepolia}${txHash}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
