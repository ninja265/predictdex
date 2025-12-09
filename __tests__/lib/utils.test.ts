import {
  generateIdempotencyKey,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  truncateAddress,
  classNames,
} from "@/lib/utils";

describe("generateIdempotencyKey", () => {
  it("generates unique keys", () => {
    const key1 = generateIdempotencyKey();
    const key2 = generateIdempotencyKey();
    expect(key1).not.toBe(key2);
  });

  it("generates keys with timestamp prefix", () => {
    const key = generateIdempotencyKey();
    const parts = key.split("-");
    expect(parts.length).toBe(2);
    expect(parseInt(parts[0])).toBeGreaterThan(0);
  });
});

describe("formatCurrency", () => {
  it("formats ETH with 4 decimal places", () => {
    expect(formatCurrency(1.5, "ETH")).toBe("1.5000 ETH");
  });

  it("formats USDC with 2 decimal places", () => {
    expect(formatCurrency(100.5, "USDC")).toBe("100.50 USDC");
  });

  it("formats USDT with 2 decimal places", () => {
    expect(formatCurrency(50, "USDT")).toBe("50.00 USDT");
  });

  it("formats other currencies with symbol prefix", () => {
    expect(formatCurrency(1000, "R")).toBe("R1,000.00");
  });
});

describe("formatPercentage", () => {
  it("converts decimal to percentage", () => {
    expect(formatPercentage(0.5)).toBe("50%");
    expect(formatPercentage(0.35)).toBe("35%");
    expect(formatPercentage(1)).toBe("100%");
  });
});

describe("truncateAddress", () => {
  it("truncates address with default chars", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(address)).toBe("0x1234...5678");
  });

  it("truncates address with custom chars", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(address, 6)).toBe("0x123456...345678");
  });
});

describe("classNames", () => {
  it("joins class names", () => {
    expect(classNames("a", "b", "c")).toBe("a b c");
  });

  it("filters falsy values", () => {
    expect(classNames("a", false, "b", null, undefined, "c")).toBe("a b c");
  });

  it("returns empty string for no valid classes", () => {
    expect(classNames(false, null, undefined)).toBe("");
  });
});

describe("formatDate", () => {
  it("formats date string", () => {
    const result = formatDate("2025-12-09T12:00:00Z");
    expect(result).toContain("Dec");
    expect(result).toContain("9");
    expect(result).toContain("2025");
  });
});

describe("formatDateTime", () => {
  it("formats datetime string with time", () => {
    const result = formatDateTime("2025-12-09T14:30:00Z");
    expect(result).toContain("Dec");
    expect(result).toContain("2025");
  });
});
