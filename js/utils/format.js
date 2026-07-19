export function getLocale() {
  const currency = localStorage.getItem('wealthdeck_currency') || 'USD';
  let locale = 'en-US';
  if (currency === 'EUR') locale = 'en-IE';
  if (currency === 'GBP') locale = 'en-GB';
  if (currency === 'INR') locale = 'en-IN';
  if (currency === 'AUD') locale = 'en-AU';
  if (currency === 'CAD') locale = 'en-CA';
  if (currency === 'JPY') locale = 'ja-JP';
  return locale;
}

export function formatCurrency(val) {
  const currency = localStorage.getItem('wealthdeck_currency') || 'USD';
  const locale = getLocale();
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format((val || 0) / 100);
}

export function getCurrencySymbol() {
  const currency = localStorage.getItem('wealthdeck_currency') || 'USD';
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

export function formatDate(dateString) {
  const locale = getLocale();
  return new Date(dateString).toLocaleDateString(locale, {
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
