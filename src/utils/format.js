export const formatKES = (amount) => `KSh ${Number(amount || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
export function formatDate(date, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return date ? date.toLocaleDateString('en-KE', options) : '';
}
