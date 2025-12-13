/**
 * Helper functions to safely extract data from API responses
 * Handles both direct array responses and wrapped object responses
 */

export function extractArrayFromResponse<T>(
  response: unknown,
  key: string
): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response as T[];
  if (typeof response === 'object' && response !== null) {
    const data = (response as Record<string, unknown>)[key];
    if (Array.isArray(data)) return data as T[];
  }
  return [];
}

export function extractTotalFromResponse(
  response: unknown,
  fallbackToArrayLength = true
): number {
  if (!response) return 0;
  if (Array.isArray(response)) {
    return fallbackToArrayLength ? response.length : 0;
  }
  if (typeof response === 'object' && response !== null) {
    const total = (response as Record<string, unknown>).total;
    if (typeof total === 'number') return total;
  }
  return 0;
}

export function normalizeListResponse<T>(
  response: unknown,
  dataKey: string
): { data: T[]; total: number } {
  const data = extractArrayFromResponse<T>(response, dataKey);
  const total = extractTotalFromResponse(response);
  return { data, total: total || data.length };
}
