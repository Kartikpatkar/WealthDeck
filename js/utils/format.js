export function formatCurrency(val) {
  const currency = localStorage.getItem('wealthdeck_currency') || 'USD';
  let locale = 'en-US';
  if (currency === 'EUR') locale = 'en-IE';
  if (currency === 'GBP') locale = 'en-GB';
  if (currency === 'INR') locale = 'en-IN';
  if (currency === 'AUD') locale = 'en-AU';
  if (currency === 'CAD') locale = 'en-CA';
  if (currency === 'JPY') locale = 'ja-JP';

  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format((val || 0) / 100);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
