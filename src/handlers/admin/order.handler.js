const { Markup } = require('telegraf');
const orderService = require('../../services/order.service');
const notificationService = require('../../services/notification.service');
const { formatDate } = require('../../utils/format');
const { buildPaginationButtons } = require('../../utils/pagination');
const { adminMenuKeyboard, orderActionsKeyboard, orderFiltersKeyboard } = require('../../keyboards/admin');
const { getLang, productTitle } = require('../../utils/localized');

async function showOrders(ctx) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const page = parseInt(ctx.match?.[1]) || 1;
  const filter = ctx.session.adminOrderFilter || null;
  const { orders, meta } = await orderService.getAll({ page, status: filter });
  const filterLabel = filter ? (t.status[filter] || filter) : t.ordersAll;

  if (!orders.length) {
    const text = t.ordersEmpty(filterLabel);
    try {
      if (ctx.callbackQuery) { await ctx.answerCbQuery(); await ctx.editMessageText(text, { parse_mode: 'HTML', ...orderFiltersKeyboard(t) }); }
      else await ctx.reply(text, { parse_mode: 'HTML', ...orderFiltersKeyboard(t) });
    } catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...orderFiltersKeyboard(t) }); }
    return;
  }

  let text = t.ordersTitle(filterLabel, meta.total, meta.page, meta.totalPages) + '\n\n';
  for (const order of orders) {
    const item = order.items[0];
    text +=
      `🔖 <b>#${order.id}</b> — ${t.status[order.status] || order.status}\n` +
      `👤 ${order.user?.fullName || '—'} | 📱 ${order.user?.phone || '—'}\n` +
      `🧣 ${productTitle(item?.product, lang) || '—'} | 💰 ${order.totalPrice.toLocaleString()}\n` +
      `🕒 ${formatDate(order.createdAt)}\n───────────────\n`;
  }

  const buttons = orders.map((o) => [
    Markup.button.callback(`#${o.id} ${o.user?.fullName || ''} — ${t.status[o.status] || o.status}`, `admin_order_view_${o.id}`),
  ]);
  const paginationBtns = buildPaginationButtons(meta, 'admin_orders');
  if (paginationBtns.length) buttons.push(paginationBtns);
  buttons.push([Markup.button.callback(t.filterBtn, 'admin_orders_filter_menu')]);

  try {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
    else await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  } catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
}

async function viewOrder(ctx) {
  const orderId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  const lang = getLang(ctx);
  const order = await orderService.getById(orderId);
  if (!order) return ctx.reply(t.orderNotFound, adminMenuKeyboard(t));

  let productsText = '';
  order.items.forEach((i) => {
    productsText += `• ${productTitle(i.product, lang)} × ${i.quantity} = ${(i.price * i.quantity).toLocaleString()}\n`;
  });

  const text = t.orderDetail(order, productsText, t) +
    `\n🕒 ${formatDate(order.createdAt)}`;

  await ctx.reply(text, { parse_mode: 'HTML', ...orderActionsKeyboard(orderId, order.status, t) });
}

async function showFilterMenu(ctx) {
  await ctx.answerCbQuery();
  const t = ctx.t;
  try { await ctx.editMessageText(t.filterBtn, orderFiltersKeyboard(t)); }
  catch (_) { await ctx.reply(t.filterBtn, orderFiltersKeyboard(t)); }
}

async function setFilter(ctx) {
  const filter = ctx.match[1];
  await ctx.answerCbQuery();
  ctx.session.adminOrderFilter = filter === 'all' ? null : filter;
  await showOrders(ctx);
}

async function changeOrderStatus(ctx) {
  const orderId = parseInt(ctx.match[1]);
  const newStatus = ctx.match[2];
  await ctx.answerCbQuery(ctx.t.success);
  const t = ctx.t;
  try {
    const order = await orderService.updateStatus(orderId, newStatus);
    await notificationService.notifyUserStatusChange(order);
    const msg = t.orderStatusChanged(orderId, t.status[newStatus] || newStatus);
    try { await ctx.editMessageText(msg, { parse_mode: 'HTML', ...orderActionsKeyboard(orderId, newStatus, t) }); }
    catch (_) { await ctx.reply(msg, { parse_mode: 'HTML', ...orderActionsKeyboard(orderId, newStatus, t) }); }
  } catch (error) {
    await ctx.reply(t.errorGeneric(error.message), adminMenuKeyboard(t));
  }
}

module.exports = { showOrders, viewOrder, showFilterMenu, setFilter, changeOrderStatus };
