export function getLocale() {
  const currency = getCurrency();
  let locale = 'en-US';
  if (currency === 'EUR') locale = 'en-IE';
  if (currency === 'GBP') locale = 'en-GB';
  if (currency === 'INR') locale = 'en-IN';
  if (currency === 'AUD') locale = 'en-AU';
  if (currency === 'CAD') locale = 'en-CA';
  if (currency === 'JPY') locale = 'ja-JP';
  return locale;
}

export function getCurrency() {
  const saved = localStorage.getItem('wealthdeck_currency');
  if (saved) return saved;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') return 'INR';
    if (tz === 'Europe/London') return 'GBP';
    if (tz && tz.startsWith('Europe/')) return 'EUR';
    if (tz === 'Australia/Sydney' || tz === 'Australia/Melbourne') return 'AUD';
  } catch(e) {}
  return 'USD';
}

export function formatCurrency(val) {
  const currency = getCurrency();
  const locale = getLocale();
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format((val || 0) / 100);
}

export function getCurrencySymbol() {
  const currency = getCurrency();
  const symbols = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'INR': '₹',
    'AUD': 'A$',
    'CAD': 'C$',
    'JPY': '¥'
  };
  return symbols[currency] || '$';
}

export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  const parts = dateStr.split('-');
  if (parts.length >= 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return new Date(dateStr);
}

export function getLocalMonthStr(dateStr) {
  const d = parseLocalDate(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatDate(dateString) {
  const locale = getLocale();
  return parseLocalDate(dateString).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
