const config = require('../config');

function getPaginationParams(page = 1, pageSize = config.pagination.pageSize) {
  const skip = (page - 1) * pageSize;
  return { skip, take: pageSize };
}

function buildPaginationMeta(total, page, pageSize = config.pagination.pageSize) {
  const totalPages = Math.ceil(total / pageSize);
  return {
    total, page, pageSize, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Build pagination buttons — uses locale if available via ctx.t
 * Falls back to emoji-only labels if no t provided
 */
function buildPaginationButtons(meta, callbackPrefix, t) {
  const buttons = [];
  const prevLabel = t?.pagePrev || '⬅️';
  const nextLabel = t?.pageNext || '➡️';

  if (meta.hasPrev) {
    buttons.push({ text: prevLabel, callback_data: `${callbackPrefix}_page_${meta.page - 1}` });
  }
  if (meta.totalPages > 1) {
    buttons.push({ text: `${meta.page}/${meta.totalPages}`, callback_data: 'noop' });
  }
  if (meta.hasNext) {
    buttons.push({ text: nextLabel, callback_data: `${callbackPrefix}_page_${meta.page + 1}` });
  }
  return buttons;
}

module.exports = { getPaginationParams, buildPaginationMeta, buildPaginationButtons };
