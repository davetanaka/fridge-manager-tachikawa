// Utility functions for date calculations and formatting

/**
 * Calculate days until expiry date
 * @param expiryDate - Date string in YYYY-MM-DD format
 * @returns Number of days until expiry (negative if expired, null if no expiry date)
 */
export function calculateDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Format date for display (e.g., "1月5日（あと3日）")
 * @param expiryDate - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 */
export function formatExpiryDate(expiryDate: string | null): string {
  if (!expiryDate) return '期限なし';
  
  const date = new Date(expiryDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const daysUntil = calculateDaysUntilExpiry(expiryDate);
  
  if (daysUntil === null) return '期限なし';
  if (daysUntil < 0) return `${month}月${day}日（${Math.abs(daysUntil)}日前に期限切れ）`;
  if (daysUntil === 0) return `${month}月${day}日（今日）`;
  if (daysUntil === 1) return `${month}月${day}日（明日）`;
  
  return `${month}月${day}日（あと${daysUntil}日）`;
}

/**
 * Get CSS class for expiry status
 * @param daysUntil - Days until expiry
 * @returns CSS class name
 */
export function getExpiryStatusClass(daysUntil: number | null): string {
  if (daysUntil === null) return 'status-no-expiry';
  if (daysUntil < 0) return 'status-expired';
  if (daysUntil <= 3) return 'status-warning';
  return 'status-normal';
}

/**
 * Get quick date options for date picker
 * @returns Array of date options
 */
export function getQuickDateOptions() {
  const today = new Date();
  
  return [
    { label: '今日', date: formatDateToISO(today) },
    { label: '明日', date: formatDateToISO(addDays(today, 1)) },
    { label: '3日後', date: formatDateToISO(addDays(today, 3)) },
    { label: '1週間後', date: formatDateToISO(addDays(today, 7)) },
    { label: '2週間後', date: formatDateToISO(addDays(today, 14)) },
    { label: '1ヶ月後', date: formatDateToISO(addDays(today, 30)) },
  ];
}

/**
 * Add days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param date - Date to format
 * @returns ISO date string
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get storage location label
 * @param location - Storage location code
 * @returns Japanese label
 */
export function getStorageLocationLabel(location: string): string {
  const labels: Record<string, string> = {
    'main_fridge': 'メイン冷蔵庫',
    'main_freezer': 'メイン冷凍庫',
    'sub_freezer': 'サブ冷凍庫',
  };
  return labels[location] || location;
}

/**
 * Get storage location icon
 * @param location - Storage location code
 * @returns Icon HTML
 */
export function getStorageLocationIcon(location: string): string {
  const icons: Record<string, string> = {
    'main_fridge': '🧊',
    'main_freezer': '❄️',
    'sub_freezer': '🧊',
  };
  return icons[location] || '📦';
}
