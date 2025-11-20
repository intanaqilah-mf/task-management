export const BASE_CONSTANTS = {
  MALAYSIA_TIMEZONE: 'Asia/Kuala_Lumpur',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 200,
  DEFAULT_DATE_FORMAT: 'yyyy-MM-dd',
  DEFAULT_DATE_TIME_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  MAX_BODY_SIZE: 30 * 1024 * 1024, // 30MB
};

export const parseDateInMalaysiaTimezone = (dateStr: string): Date => {
  // If already has time component, use as-is
  if (dateStr.includes('T') && !dateStr.endsWith('T00:00:00')) {
    return new Date(dateStr);
  }

  // For date-only strings, append noon time to avoid timezone shifting
  const dateOnly = dateStr.split('T')[0];
  return new Date(dateOnly + 'T12:00:00');
};
