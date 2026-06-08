const { Markup } = require('telegraf');
const cartService = require('../../services/cart.service');
const orderService = require('../../services/order.service');
const userService = require('../../services/user.service');
const notificationService = require('../../services/notification.service');
const { mainMenuKeyboard, cancelKeyboard, shareLocationKeyboard, skipEmailKeyboard, cartKeyboard } = require('../../keyboards/customer');
const { isValidEmail, isValidAddress, isValidUzCard } = require('../../utils/validation');
const { getLang, productTitle } = require('../../utils/localized');

function buildCartText(items, t, lang = 'ru') {
  let lines = '';
  let total = 0;
  items.forEach((item, i) => {
    const sub = item.product.price * item.quantity;
    total += sub;
    lines += `${i + 1}. <b>${productTitle(item.product, lang)}</b>\n   ${item.quantity} × ${item.product.price.toLocaleString()} = ${sub.toLocaleString()}\n\n`;
  });
  return { text: t.cartTitle(lines) + '\n' + t.cartTotal(total), total };
}

async function showCart(ctx) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const items = await cartService.getCart(ctx.state.user.id);

  if (!items.length) {
    try {
      if (ctx.callbackQuery) { await ctx.answerCbQuery(); await ctx.editMessageText(t.cartEmpty, { parse_mode: 'HTML' }); }
      else await ctx.reply(t.cartEmpty, { parse_mode: 'HTML' });
    } catch (_) { await ctx.reply(t.cartEmpty, { parse_mode: 'HTML' }); }
    return;
  }

  const { text } = buildCartText(items, t, lang);
  const keyboard = cartKeyboard(items, t, lang);

  if (ctx.callbackQuery) {
    await ctx.answerCbQuery();
    try { await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard }); }
    catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...keyboard }); }
  } else {
    await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
  }
}

async function cartIncrease(ctx) {
  await cartService.updateQty(ctx.state.user.id, parseInt(ctx.match[1]), 1);
  await ctx.answerCbQuery();
  await showCart(ctx);
}

async function cartDecrease(ctx) {
  await cartService.updateQty(ctx.state.user.id, parseInt(ctx.match[1]), -1);
  await ctx.answerCbQuery();
  await showCart(ctx);
}

async function cartRemove(ctx) {
  await cartService.removeItem(ctx.state.user.id, parseInt(ctx.match[1]));
  await ctx.answerCbQuery(ctx.t.cartUpdated);
  await showCart(ctx);
}

async function cartClear(ctx) {
  await ctx.answerCbQuery();
  await cartService.clearCart(ctx.state.user.id);
  const t = ctx.t;
  try { await ctx.editMessageText(t.cartCleared); } catch (_) { await ctx.reply(t.cartCleared); }
}

async function startCartCheckout(ctx) {
  await ctx.answerCbQuery();
  const t = ctx.t;
  const user = ctx.state.user;
  const items = await cartService.getCart(user.id);

  if (!items.length) return ctx.reply(t.cartEmpty, { parse_mode: 'HTML' });
  if (!user.fullName || !user.phone) return ctx.reply(t.registerFirst, { parse_mode: 'HTML', ...mainMenuKeyboard(t) });

  const { text } = buildCartText(items, t, getLang(ctx));

  ctx.session.checkout = {
    step: 'email',
    data: { fullName: user.fullName, phone: user.phone, address: user.address || null, email: user.email || null },
  };

  await ctx.reply(
    `${t.checkoutSummary}\n\n${text.replace(t.cartTitle('').split('\n')[0], '')}\n\n${t.checkoutEmail}`,
    { parse_mode: 'HTML', ...skipEmailKeyboard(t) },
  );
}

async function handleCheckoutStep(ctx) {
  const checkout = ctx.session.checkout;
  if (!checkout) return false;
  const t = ctx.t;

  // Native Telegram location pin - handles both address step and dedicated location step
  if (ctx.message?.location) {
    const { latitude, longitude } = ctx.message.location;
    if (checkout.step === 'address') {
      // User sent location instead of typing - store coords + text address
      checkout.data.address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      checkout.data.deliveryLatitude = latitude;
      checkout.data.deliveryLongitude = longitude;
      checkout.step = 'card';
      await ctx.reply(t.checkoutCard, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    if (checkout.step === 'location') {
      // Dedicated location step - store coords and continue
      checkout.data.deliveryLatitude = latitude;
      checkout.data.deliveryLongitude = longitude;
      checkout.step = 'card';
      await ctx.reply(t.checkoutCard, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
  }

  const text = ctx.message?.text?.trim();
  if (!text) return false;

  if (checkout.step === 'email') {
    if (text === t.skip || text === '⏩') {
      checkout.data.email = ctx.state.user.email || null;
    } else {
      if (!isValidEmail(text)) { await ctx.reply(t.invalidEmail, { parse_mode: 'HTML', ...skipEmailKeyboard(t) }); return true; }
      checkout.data.email = text;
    }
    checkout.step = 'address';
    const hint = checkout.data.address ? `\n\n💡 ${checkout.data.address}` : '';
    await ctx.reply(t.checkoutAddress + hint, { parse_mode: 'HTML', ...shareLocationKeyboard(t) });
    return true;
  }

  if (checkout.step === 'address') {
    if (text === t.enterManual) {
      checkout.awaitManualAddress = true;
      await ctx.reply(t.checkoutAddress, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    if (checkout.awaitManualAddress || checkout.data.address) {
      if (checkout.awaitManualAddress) {
        if (!isValidAddress(text)) { await ctx.reply(t.invalidAddress, { parse_mode: 'HTML', ...cancelKeyboard(t) }); return true; }
        checkout.data.address = text;
        delete checkout.awaitManualAddress;
      }
      checkout.step = 'location';
      await ctx.reply(t.checkoutLocation, {
        parse_mode: 'HTML',
        ...Markup.keyboard([
          [Markup.button.locationRequest(t.sendLocation)],
          [t.cancel],
        ]).resize(),
      });
      return true;
    }
    if (!isValidAddress(text)) { await ctx.reply(t.invalidAddress, { parse_mode: 'HTML', ...shareLocationKeyboard(t) }); return true; }
    checkout.data.address = text;
    checkout.step = 'location';
    await ctx.reply(t.checkoutLocation, {
      parse_mode: 'HTML',
      ...Markup.keyboard([
        [Markup.button.locationRequest(t.sendLocation)],
        [t.cancel],
      ]).resize(),
    });
    return true;
  }

  if (checkout.step === 'card') {
    const cleaned = text.replace(/[\s\-]/g, '');
    if (!isValidUzCard(cleaned)) {
      await ctx.reply(t.invalidCard, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    checkout.data.cardLastFour = cleaned.slice(-4);
    checkout.data.cardLastEight = cleaned.slice(-8);
    checkout.step = 'confirm';
    return showCheckoutConfirmation(ctx);
  }

  return false;
}

async function showCheckoutConfirmation(ctx) {
  const { data } = ctx.session.checkout;
  const t = ctx.t;
  const lang = getLang(ctx);
  const user = ctx.state.user;
  const items = await cartService.getCart(user.id);

  let summary = `${t.checkoutConfirm}\n\n`;
  let total = 0;
  items.forEach((item) => {
    const sub = item.product.price * item.quantity;
    total += sub;
    summary += `• ${productTitle(item.product, lang)} × ${item.quantity} = ${sub.toLocaleString()}\n`;
  });
  summary +=
    `\n━━━━━━━━━━━━━━\n💰 <b>${total.toLocaleString()}</b>\n\n` +
    `👤 ${data.fullName} | 📱 ${data.phone}\n` +
    `📧 ${data.email || '—'} | 📍 ${data.address || '—'}\n` +
    (data.deliveryLatitude ? `🗺 ${data.deliveryLatitude.toFixed(5)}, ${data.deliveryLongitude.toFixed(5)}\n` : '') +
    `💳 **** **** **** ${data.cardLastFour}`;

  await ctx.reply(summary, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback(t.confirm, 'confirm_order')],
      [Markup.button.callback(t.cancelOrderBtn, 'cancel_order')],
    ]),
  });
  return true;
}

async function confirmOrder(ctx) {
  await ctx.answerCbQuery();
  const checkout = ctx.session.checkout;
  if (!checkout) return ctx.reply(ctx.t.sessionExpired, { parse_mode: 'HTML', ...mainMenuKeyboard(ctx.t) });
  const { data } = checkout;
  const user = ctx.state.user;
  const t = ctx.t;
  const items = await cartService.getCart(user.id);
  if (!items.length) { delete ctx.session.checkout; return ctx.reply(t.cartEmpty, { parse_mode: 'HTML', ...mainMenuKeyboard(t) }); }

  try {
    await userService.updateProfile(user.telegramId, { email: data.email, address: data.address });
    const order = await orderService.createFromCart(user.id, items, data.cardLastFour, {
      deliveryLatitude: data.deliveryLatitude || null,
      deliveryLongitude: data.deliveryLongitude || null,
    });
    await cartService.clearCart(user.id);
    await notificationService.notifyAdminNewOrder(order, data.cardLastEight);
    delete ctx.session.checkout;
    await ctx.reply(t.orderPlaced(order.id), { parse_mode: 'HTML', ...mainMenuKeyboard(t) });
  } catch (error) {
    await ctx.reply(t.errorGeneric(error.message), { parse_mode: 'HTML', ...mainMenuKeyboard(t) });
  }
}

async function cancelOrder(ctx) {
  await ctx.answerCbQuery();
  delete ctx.session.checkout;
  await ctx.reply(ctx.t.cancelOrderBtn, mainMenuKeyboard(ctx.t));
}

module.exports = {
  showCart, cartIncrease, cartDecrease, cartRemove, cartClear,
  startCartCheckout, handleCheckoutStep, confirmOrder, cancelOrder,
};
