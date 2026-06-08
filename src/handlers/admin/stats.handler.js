const orderService = require('../../services/order.service');
const userService = require('../../services/user.service');
const productService = require('../../services/product.service');
const { adminMenuKeyboard } = require('../../keyboards/admin');
const { getLang, productTitle } = require('../../utils/localized');

async function showStats(ctx) {
  const t = ctx.t;
  const [stats, totalUsers, mostPurchased] = await Promise.all([
    orderService.getStats(),
    userService.count(),
    productService.getMostPurchased(),
  ]);

  const topProduct = mostPurchased
    ? `${productTitle(mostPurchased.product, getLang(ctx))} ${t.statsSold(mostPurchased.totalSold)}`
    : t.statsNoData;

  const text =
    `${t.statsTitle}\n\n` +
    `👥 <b>${t.statsUsers}:</b> ${totalUsers}\n` +
    `📦 <b>${t.statsOrders}:</b> ${stats.totalOrders}\n` +
    `💰 <b>${t.statsRevenue}:</b> ${stats.totalRevenue.toLocaleString()}\n\n` +
    `📅 <b>${t.statsToday}:</b> ${stats.dailyOrders}\n` +
    `📆 <b>${t.statsMonth}:</b> ${stats.monthlyOrders}\n\n` +
    `🏆 <b>${t.statsTopProduct}:</b> ${topProduct}`;

  await ctx.reply(text, { parse_mode: 'HTML', ...adminMenuKeyboard(t) });
}

module.exports = { showStats };
