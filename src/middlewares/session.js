/**
 * Простое in-memory хранилище сессий
 * Для продакшена замените на Redis или DB-based сессии
 */
const sessions = new Map();

function getSessionKey(ctx) {
  const chatId = ctx.chat?.id || ctx.from?.id;
  return chatId ? String(chatId) : null;
}

/**
 * Middleware сессий
 */
async function sessionMiddleware(ctx, next) {
  const key = getSessionKey(ctx);
  if (!key) return next();

  if (!sessions.has(key)) {
    sessions.set(key, {});
  }

  ctx.session = sessions.get(key);

  await next();

  sessions.set(key, ctx.session);
}

/**
 * Очистить сессию пользователя
 */
function clearSession(ctx) {
  const key = getSessionKey(ctx);
  if (key) sessions.set(key, {});
}

module.exports = { sessionMiddleware, clearSession };
