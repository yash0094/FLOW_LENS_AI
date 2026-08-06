export function fmtDuration(seconds) {
  if (seconds == null || isNaN(seconds)) return '-';
  const min = seconds / 60;
  if (min < 60) return `${min.toFixed(1)} min`;
  const hrs = min / 60;
  if (hrs < 24) return `${hrs.toFixed(1)} hrs`;
  return `${(hrs / 24).toFixed(1)} days`;
}

export function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString();
}
