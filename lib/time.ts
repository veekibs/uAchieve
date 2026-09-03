/**
 * Formats time inputs (ISO strings, plain "HH:MM:SS" or "HH:MM") into 12-hour AM/PM format
 * without performing local timezone conversions.
 */
export function formatTimeString(timeInput: any): string {
  if (!timeInput) return '';
  let timeStr = typeof timeInput === 'string' ? timeInput : timeInput.toISOString();
  if (timeStr.includes('T')) {
    timeStr = timeStr.split('T')[1];
  }
  const [hStr, mStr] = timeStr.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = parseInt(mStr, 10);
  if (isNaN(hours)) return '';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = isNaN(minutes) ? '00' : (minutes < 10 ? `0${minutes}` : minutes);
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
}

export function formatTimeRange(startTime: any, endTime: any): string {
  const start = formatTimeString(startTime);
  const end = formatTimeString(endTime);
  if (start && end) return `${start} – ${end}`;
  if (start) return start;
  return '';
}

