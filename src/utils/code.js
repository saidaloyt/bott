const crypto = require('crypto');

/**
 * Генерация уникального кода доступа (6 символов, только цифры)
 */
function generateAccessCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { generateAccessCode };
