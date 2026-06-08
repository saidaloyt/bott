const config = require('../../config');
const { adminMenuKeyboard } = require('../../keyboards/admin');
const { mainMenuKeyboard } = require('../../keyboards/customer');

async function openAdminPanel(ctx) {
  const user = ctx.state.user;
  if (!user) return ctx.reply(ctx.t?.noAccess || '⛔️');

  const isMainAdmin = ctx.from.id === config.bot.adminId;
  const isSubAdmin = user.isSubAdmin;
  if (!isMainAdmin && !isSubAdmin) return ctx.reply(ctx.t.noAccess);

  ctx.session.isAdminMode = true;
  const t = ctx.t;
  const role = isMainAdmin ? t.adminRoleMain : t.adminRoleSub;

  await ctx.reply(t.adminWelcome(role), { parse_mode: 'HTML', ...adminMenuKeyboard(t) });
}

async function backToMain(ctx) {
  ctx.session.isAdminMode = false;
  const t = ctx.t;
  await ctx.reply('🏠', mainMenuKeyboard(t));
}

module.exports = { openAdminPanel, backToMain };
