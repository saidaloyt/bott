/**
 * Форматирование цены в UZS
 */
function formatPrice(amount) {
  return new Intl.NumberFormat('ru-UZ').format(amount) + ' сум';
}

/**
 * Форматирование даты
 */
function formatDate(date) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Статус заказа на русском
 */
function formatOrderStatus(status) {
  const statuses = {
    pending: '⏳ Ожидает обработки',
    delivering: '🚚 Доставляется',
    delivered: '✅ Доставлен',
    cancelled: '❌ Отменён',
  };
  return statuses[status] || status;
}

/**
 * Эмодзи статуса
 */
function statusEmoji(status) {
  const emojis = {
    pending: '⏳',
    delivering: '🚚',
    delivered: '✅',
    cancelled: '❌',
  };
  return emojis[status] || '❓';
}

/**
 * Обрезка длинного текста
 */
function truncate(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

/**
 * Экранирование MarkdownV2
 */
function escapeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

module.exports = {
  formatPrice,
  formatDate,
  formatOrderStatus,
  statusEmoji,
  truncate,
  escapeMarkdown,
};
