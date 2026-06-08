const { Markup } = require('telegraf');
const { productTitle } = require('../utils/localized');

// ── Language selection (always shown first) ───────────────
const langKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🇺🇿 O'zbek", 'lang_uz')],
  [Markup.button.callback('🇷🇺 Русский', 'lang_ru')],
  [Markup.button.callback('🇬🇧 English', 'lang_en')],
]);

// ── Main menu (translated) ────────────────────────────────
function mainMenuKeyboard(t) {
  return Markup.keyboard([
    [t.menuShop, t.menuCart],
    [t.menuOrders, t.menuProfile],
    [t.menuAbout, t.menuContacts],
  ]).resize();
}

function authChoiceKeyboard(t) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.registerBtn, 'auth_register')],
    [Markup.button.callback(t.loginBtn, 'auth_login')],
  ]);
}

// ── Cancel keyboard (translated) ─────────────────────────
function cancelKeyboard(t) {
  return Markup.keyboard([[t.cancel]]).resize();
}

// ── Share phone (translated) ──────────────────────────────
function sharePhoneKeyboard(t) {
  return Markup.keyboard([
    [Markup.button.contactRequest(t.sharePhone)],
    [t.cancel],
  ]).resize();
}

// ── Share location (translated) ───────────────────────────
function shareLocationKeyboard(t) {
  return Markup.keyboard([
    [Markup.button.locationRequest(t.sendLocation)],
    [t.enterManual],
    [t.cancel],
  ]).resize();
}

// ── Skip email (translated) ───────────────────────────────
function skipEmailKeyboard(t) {
  return Markup.keyboard([
    [t.skip],
    [t.cancel],
  ]).resize();
}

// ── Profile keyboard (translated) ────────────────────────
function profileKeyboard(t) {
  return Markup.keyboard([
    [t.editProfile, t.changeLang],
    [t.back],
  ]).resize();
}

// ── Edit profile inline ───────────────────────────────────
function editProfileInlineKeyboard(t) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('👤 ' + t.profileName, 'edit_name'),
     Markup.button.callback('📱 ' + t.profilePhone, 'edit_phone')],
    [Markup.button.callback('📧 ' + t.profileEmail, 'edit_email')],
    [Markup.button.callback(t.done, 'profile_done')],
  ]);
}

// ── Product qty + cart ────────────────────────────────────
function productKeyboard(productId, qty, categoryId, t, backData = null) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('➖', `qty_minus_${productId}`),
      Markup.button.callback(`${qty}`, 'noop'),
      Markup.button.callback('➕', `qty_plus_${productId}`),
    ],
    [Markup.button.callback(t.addToCart, `cart_add_${productId}`)],
    [Markup.button.callback(t.back, backData || `cat_${categoryId}`)],
  ]);
}

// ── Cart keyboard ─────────────────────────────────────────
function cartKeyboard(items, t, lang = 'ru') {
  const buttons = items.map((item) => [
    Markup.button.callback('➖', `cart_dec_${item.productId}`),
    Markup.button.callback(`${productTitle(item.product, lang).slice(0, 18)} ×${item.quantity}`, 'noop'),
    Markup.button.callback('➕', `cart_inc_${item.productId}`),
    Markup.button.callback('❌', `cart_rm_${item.productId}`),
  ]);
  buttons.push([Markup.button.callback(t.checkout, 'cart_checkout')]);
  buttons.push([Markup.button.callback(t.clearCart, 'cart_clear')]);
  buttons.push([Markup.button.callback(t.back, 'shop_categories')]);
  return Markup.inlineKeyboard(buttons);
}

module.exports = {
  langKeyboard,
  authChoiceKeyboard,
  mainMenuKeyboard,
  cancelKeyboard,
  sharePhoneKeyboard,
  shareLocationKeyboard,
  skipEmailKeyboard,
  profileKeyboard,
  editProfileInlineKeyboard,
  productKeyboard,
  cartKeyboard,
};
