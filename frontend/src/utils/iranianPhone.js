export function validateIranianPhone(phone) {
  if (!phone) return false;

  const cleaned = phone.replace(/[\s\-()]/g, '');

  // +989123456789 or 00989123456789
  if (/^(\+98|0098)9\d{9}$/.test(cleaned)) return true;
  // 989123456789
  if (/^989\d{9}$/.test(cleaned)) return true;
  // 09123456789 (standard Iranian mobile)
  if (/^09\d{9}$/.test(cleaned)) return true;
  // 9123456789 (without leading zero)
  if (/^9\d{9}$/.test(cleaned)) return true;
  // General Iranian phone with area code (11 digits starting with 0) or international
  if (/^0\d{10}$/.test(cleaned)) return true;

  // Fallback for general valid phone lengths
  if (/^\+?\d{10,14}$/.test(cleaned)) return true;

  return false;
}

export function formatIranianPhone(phone) {
  if (!phone) return '';

  const cleaned = phone.replace(/[\s\-()]/g, '');

  if (cleaned.startsWith('+98')) {
    return cleaned;
  }

  if (cleaned.startsWith('0098')) {
    return '+' + cleaned.substring(2);
  }

  if (cleaned.startsWith('98') && cleaned.length === 12) {
    return '+' + cleaned;
  }

  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '+98' + cleaned.substring(1);
  }

  if (cleaned.startsWith('9') && cleaned.length === 10) {
    return '+98' + cleaned;
  }

  return cleaned;
}

export function normalizeIranianPhone(phone) {
  return formatIranianPhone(phone);
}

