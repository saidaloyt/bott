const { Markup } = require('telegraf');
const orderService = require('../../services/order.service');
const { formatDate } = require('../../utils/format');
const { buildPaginationButtons } = require('../../utils/pagination');
const { mainMenuKeyboard } = require('../../keyboards/customer');
const { getLang, productTitle } = require('../../utils/localized');

async function showMyOrders(ctx) {
  const user = ctx.state.user;
  const t = ctx.t;
  const lang = getLang(ctx);
  const page = parseInt(ctx.match?.[1]) || 1;
  const { orders, meta } = await orderService.getUserOrders(user.id, page);

  if (!orders.length) {
    return ctx.reply(t.noOrders, mainMenuKeyboard(t));
  }

  let text = `${t.myOrders} (${meta.total})\n\n`;
  orders.forEach((order) => {
    text += `🔖 <b>#${order.id}</b> — ${t.status[order.status] || order.status}\n`;
    order.items.forEach((item) => {
      text += `   • ${productTitle(item.product, lang)} × ${item.quantity}\n`;
    });
    text += `   💰 ${order.totalPrice.toLocaleString()} | 🕒 ${formatDate(order.createdAt)}\n`;
    text += `───────────────\n`;
  });

  const buttons = [];
  for (const order of orders) {
    const row = [Markup.button.callback(`#${order.id} — ${t.status[order.status] || order.status}`, `order_detail_${order.id}`)];
    if (order.status === 'pending') {
      row.push(Markup.button.callback('❌', `order_cancel_${order.id}`));
    }
    buttons.push(row);
  }

  const paginationBtns = buildPaginationButtons(meta, 'my_orders');
  if (paginationBtns.length) buttons.push(paginationBtns);

  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    }
  } catch (_) {
    await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  }
}

async function cancelUserOrder(ctx) {
  const orderId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  try {
    await orderService.cancelUserOrder(orderId, ctx.state.user.id);
    await ctx.reply(t.orderCancelled(orderId), mainMenuKeyboard(t));
  } catch (_) {
    await ctx.reply(t.cannotCancel, mainMenuKeyboard(t));
  }
}

module.exports = { showMyOrders, cancelUserOrder };
