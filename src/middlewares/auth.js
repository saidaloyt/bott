const { prisma } = require('../config/database');
const logger = require('../utils/logger');

async function loadUser(ctx, next) {
  if (!ctx.from) return next();
  try {
    const telegramId = String(ctx.from.id);
    const fullName = [ctx.from.first_name, ctx.from.last_name]
      .filter(Boolean).join(' ') || null;

    // upsert avoids race condition & unique constraint crash
    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {},
      create: { telegramId, fullName, language: 'ru' },
    });

    ctx.state.user = user;
  } catch (error) {
    logger.error('loadUser error', { error: error.message });
  }
  return next();
}

async function requireAdmin(ctx, next) {
  const config = require('../config');
  const user = ctx.state.user;
  if (ctx.from?.id !== config.bot.adminId && !user?.isSubAdmin) {
    await ctx.reply(ctx.t?.noAccess || '⛔️ Нет доступа.');
    return;
  }
  return next();
}

module.exports = { loadUser, requireAdmin };
