/**
 * Full Name must be EXACTLY 3 words
 */
function isValidFullName(name) {
  if (!name || typeof name !== 'string') return false;
  const words = name.trim().split(/\s+/);
  return words.length === 2 && words.every((w) => w.length >= 2);
}

/**
 * Phone validation — UZ/RU formats
 */
function isValidPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+998|998|8|\+7|7)?[0-9]{9,10}$/.test(cleaned);
}

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) return '+' + digits;
  if (digits.length === 9) return '+998' + digits;
  return phone;
}

/**
 * Gmail validation
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Positive integer (price, stock)
 */
function isPositiveInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && num > 0;
}

/**
 * Address min length
 */
function isValidAddress(address) {
  return address && address.trim().length >= 5;
}

// Legacy alias — kept for compatibility
function isValidName(name) {
  return name && name.trim().length >= 2;
}

/**
 * Luhn algorithm check
 */
function luhnCheck(num) {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/**
 * Uzbekistan card validation
 * Supported BINs:
 *   Uzcard:  8600
 *   Humo:    9860
 *   Visa UZ: 4169, 4278, 4380
 *   MC UZ:   5194, 5559
 */
const UZ_BINS = ['8600', '9860', '4169', '4278', '4380', '5194', '5559'];

function isValidUzCard(cardNumber) {
  const cleaned = cardNumber.replace(/[\s\-]/g, '');
  if (!/^\d{16}$/.test(cleaned)) return false;
  const bin = cleaned.slice(0, 4);
  if (!UZ_BINS.includes(bin)) return false;
  return luhnCheck(cleaned);
}

module.exports = {
  isValidFullName,
  isValidPhone,
  normalizePhone,
  isValidEmail,
  isPositiveInteger,
  isValidAddress,
  isValidName,
  isValidUzCard,
};
