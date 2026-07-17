export function formatCurrency(amount) {
  // Store amounts natively, but when rendering use Intl API
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD' // Would pull from settings in full version
  }).format(amount);
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}
