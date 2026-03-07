export function formatCurrency(
  amount: number,
  currency: string = 'PHP',
  locale: string = 'en-PH'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
