const { Markup } = require('telegraf');
const userService = require('../../services/user.service');
const orderService = require('../../services/order.service');
const { formatDate } = require('../../utils/format');
const { buildPaginationButtons } = require('../../utils/pagination');
const { adminMenuKeyboard, adminCancelKeyboard } = require('../../keyboards/admin');
const { getLang, productTitle } = require('../../utils/localized');

async function showUsers(ctx) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const page = parseInt(ctx.match?.[1]) || 1;
  const { users, meta } = await userService.getAll(page);

  if (!users.length) return ctx.reply(t.usersEmpty, adminMenuKeyboard(t));

  let text = t.usersTitle(meta.total, meta.page, meta.totalPages) + '\n\n';
  users.forEach((u) => {
    const role = u.isAdmin ? '👑' : u.isSubAdmin ? '👮' : '👤';
    text += `${role} <b>${u.fullName || '—'}</b> | 📦 ${u._count?.orders || 0}\n`;
  });

  const buttons = users.map((u) => [
    Markup.button.callback(
      `${u.isSubAdmin ? '👮 ' : '👤 '}${u.fullName || '—'} (${u._count?.orders || 0})`,
      `admin_user_view_${u.id}`,
    ),
  ]);
  const paginationBtns = buildPaginationButtons(meta, 'admin_users');
  if (paginationBtns.length) buttons.push(paginationBtns);
  buttons.push([Markup.button.callback(t.usersSearch, 'admin_users_search')]);

  try {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
    else await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  } catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
}

async function viewUser(ctx) {
  const userId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  const user = await userService.findById(userId);
  if (!user) return ctx.reply(t.usersEmpty, adminMenuKeyboard(t));

  const { orders } = await orderService.getUserOrders(userId, 1);
  const role = user.isAdmin ? t.userRoleAdmin : user.isSubAdmin ? t.userRoleMod : t.userRoleCustomer;

  let text =
    `${t.userProfile}\n\n${role}\n` +
    `🆔 ${user.telegramId}\n` +
    `👤 ${user.fullName || '—'}\n` +
    `📱 ${user.phone || '—'}\n` +
    `📧 ${user.email || '—'}\n` +
    `🌐 ${user.language || '—'}\n` +
    `📦 ${t.userOrdersCount}: ${user._count?.orders || 0}\n` +
    `📅 ${t.userRegistered}: ${formatDate(user.createdAt)}\n\n`;

  if (orders.length) {
    text += `<b>${t.userRecentOrders}:</b>\n`;
    orders.slice(0, 3).forEach((o) => {
      const item = o.items[0];
      text += `• #${o.id} — ${productTitle(item?.product, lang) || '—'} — ${o.totalPrice.toLocaleString()} — ${t.status[o.status] || o.status}\n`;
    });
  }

  await ctx.reply(text, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([[Markup.button.callback(t.back, 'admin_users_page_1')]]),
  });
}

async function startSearchUsers(ctx) {
  await ctx.answerCbQuery();
  ctx.session.adminAction = { type: 'search_users' };
  await ctx.reply(ctx.t.usersSearchPrompt, adminCancelKeyboard);
}

async function handleUserSearch(ctx) {
  const action = ctx.session.adminAction;
  if (!action || action.type !== 'search_users') return false;
  const query = ctx.message?.text?.trim();
  if (!query) return false;
  delete ctx.session.adminAction;
  const t = ctx.t;

  const { users, meta } = await userService.search(query);
  if (!users.length) {
    await ctx.reply(t.usersNotFound(query), { parse_mode: 'HTML', ...adminMenuKeyboard(t) });
    return true;
  }

  const buttons = users.map((u) => [
    Markup.button.callback(`👤 ${u.fullName || '—'} — ${u.phone || u.email || '—'}`, `admin_user_view_${u.id}`),
  ]);
  buttons.push([Markup.button.callback(t.back, 'admin_users_page_1')]);
  await ctx.reply(t.usersFound(meta.total), { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  return true;
}

module.exports = { showUsers, viewUser, startSearchUsers, handleUserSearch };
