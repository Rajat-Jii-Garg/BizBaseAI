const LOCALE_BY_CURRENCY = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AED: 'en-AE',
  SGD: 'en-SG',
  AUD: 'en-AU',
  CAD: 'en-CA',
};

export const CURRENCIES = Object.keys(LOCALE_BY_CURRENCY);

export const formatMoney = (amount, currency = 'INR') => {
  const value = Number(amount || 0);
  const locale = LOCALE_BY_CURRENCY[currency] || 'en-IN';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString('en-IN')}`;
  }
};

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Tax breakup helper. India = GST (split into CGST/SGST for intra-state).
export const taxBreakup = (taxableAmount, rate, taxMode = 'gst', interState = false) => {
  const total = (Number(taxableAmount) || 0) * (Number(rate) || 0) / 100;
  if (taxMode !== 'gst') return [{ label: taxMode === 'vat' ? `VAT ${rate}%` : `Tax ${rate}%`, amount: total }];
  if (interState) return [{ label: `IGST ${rate}%`, amount: total }];
  return [
    { label: `CGST ${rate / 2}%`, amount: total / 2 },
    { label: `SGST ${rate / 2}%`, amount: total / 2 },
  ];
};
