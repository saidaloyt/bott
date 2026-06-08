/**
 * Валидация номера телефона
 */
function isValidPhone(phone) {
  return /^\+?[\d\s\-()]{7,15}$/.test(phone.trim());
}

/**
 * Валидация email
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Валидация положительного числа
 */
function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}

/**
 * Валидация целого положительного числа
 */
function isPositiveInteger(value) {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && String(num) === String(value).trim();
}

module.exports = { isValidPhone, isValidEmail, isPositiveNumber, isPositiveInteger };
