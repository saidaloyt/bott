const { Telegraf } = require('telegraf');
const config = require('../config');
const { connectDatabase } = require('../config/database');
const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

const { loadUser } = require('../middlewares/auth');
const { errorHandler } = require('../middlewares/error');
const { sessionMiddleware } = require('../middlewares/session');
const { i18nMiddleware } = require('../utils/i18n');

// Customer
const { startHandler, helpHandler } = require('../handlers/customer/start.handler');
const { showAbout, showContacts } = require('../handlers/customer/info.handler');
const {
  showCategories, handleCategory, handleCategoryProductsPage,
  showProduct, handleQtyMinus, handleQtyPlus, handleAddToCart,
  searchProducts, handleSearchQuery,
} = require('../handlers/customer/shop.handler');
const {
  showCart, cartIncrease, cartDecrease, cartRemove, cartClear,
  startCartCheckout, handleCheckoutStep, confirmOrder, cancelOrder,
} = require('../handlers/customer/cart.handler');
const { showMyOrders, cancelUserOrder } = require('../handlers/customer/order.handler');
const {
  handleLangSelect, handleRegistrationStep,
  startRegistration, startLogin, handleLoginCode,
  showProfile, showEditProfile, handleEditProfileCallback,
  handleContactEdit, handleProfileEdit, profileDone, showLangSelect,
} = require('../handlers/customer/profile.handler');

// Admin
const { openAdminPanel, backToMain } = require('../handlers/admin/main.handler');
const { showStats } = require('../handlers/admin/stats.handler');
const {
  showCategories: adminShowCats, viewCategory,
  startAddRootCategory, startAddSubCategory, startRenameCategory,
  confirmDeleteCategory, executeDeleteCategory, handleCategoryInput,
} = require('../handlers/admin/category.handler');
const {
  showProducts,
  viewProduct,
  startAddProduct,
  pickRootCategory,
  pickSubCategory,
  handleAddProductStep,
  startEditProduct,

  startAddPhoto,
  handleProductPhoto,

  showPhotoMenu,
  showPhotos,
  showDeletePhotoMenu,
  deletePhoto,

  showPhotoPresets,
  usePresetForProduct,

  handleProductInput,
  confirmDeleteProduct,
  executeDeleteProduct,
} = require('../handlers/admin/product.handler');
const { showOrders, viewOrder, showFilterMenu, setFilter, changeOrderStatus } = require('../handlers/admin/order.handler');
const { showUsers, viewUser, startSearchUsers, handleUserSearch } = require('../handlers/admin/user.handler');
const {
  showSettings, showSubAdmins, showAdminRequests,
  approveSubAdmin, denySubAdmin, revokeSubAdmin,
  showPhotoPresetsSettings, startAddPreset, handlePresetPhoto, handlePresetName, deletePreset,
  requestAdminAccess,
} = require('../handlers/admin/settings.handler');

// All possible translations of menu buttons
const ALL = {
  shop:        ['🛍 Магазин', "🛍 Do'kon", '🛍 Shop'],
  cart:        ['🛒 Корзина', '🛒 Savat', '🛒 Cart'],
  orders:      ['📦 Мои заказы', '📦 Buyurtmalarim', '📦 My Orders'],
  profile:     ['👤 Профиль', '👤 Profil', '👤 Profile'],
  about:       ['ℹ️ О нас', 'ℹ️ Biz haqimizda', 'ℹ️ About Us'],
  contacts:    ['📞 Контакты', '📞 Aloqa', '📞 Contacts'],
  editProfile: ['✏️ Редактировать', '✏️ Tahrirlash', '✏️ Edit Profile'],
  changeLang:  ['🌐 Язык', '🌐 Til', '🌐 Language'],
  back:        ['⬅️ Назад', '⬅️ Orqaga', '⬅️ Back'],
  // Admin
  stats:       ['📊 Статистика', '📊 Statistika', '📊 Statistics'],
  cats:        ['📂 Категории', '📂 Kategoriyalar', '📂 Categories'],
  products:    ['🧣 Товары', '🧣 Mahsulotlar', '🧣 Products'],
  aOrders:     ['📦 Заказы', '📦 Buyurtmalar', '📦 Orders'],
  users:       ['👥 Пользователи', '👥 Foydalanuvchilar', '👥 Users'],
  settings:    ['⚙️ Настройки', '⚙️ Sozlamalar', '⚙️ Settings'],
  adminMain:   ['🏠 Главное меню', '🏠 Asosiy menyu', '🏠 Main Menu'],
  cancel:      ['❌ Отмена', '❌ Bekor qilish', '❌ Cancel', '❌ Отмена / Cancel / Bekor qilish'],
};

async function createBot() {
  await connectDatabase();
  const bot = new Telegraf(config.bot.token);
  notificationService.setBot(bot);
  bot.catch(errorHandler);

  bot.use(sessionMiddleware);
  bot.use(loadUser);
  bot.use(i18nMiddleware);

  // ── Commands ──────────────────────────────────────────────
  bot.command('start', startHandler);
  bot.command('help', helpHandler);
  bot.command('admin', openAdminPanel);
  bot.command('moderator', requestAdminAccess);

  // ── Language selection (inline) ───────────────────────────
  bot.action(/^lang_(ru|uz|en)$/, handleLangSelect);
  bot.action('auth_register', startRegistration);
  bot.action('auth_login', startLogin);

  // ── Cancel (universal, all languages) ────────────────────
  bot.hears(ALL.cancel, async (ctx) => {
    delete ctx.session.checkout;
    delete ctx.session.adminAction;
    delete ctx.session.registration;
    delete ctx.session.editProfile;
    delete ctx.session.awaitingLoginCode;
    delete ctx.session.awaitingSearch;
    if (ctx.session.isAdminMode) return openAdminPanel(ctx);
    return startHandler(ctx);
  });

  // ── Customer reply keyboard (all 3 languages) ─────────────
  bot.hears(ALL.shop, showCategories);
  bot.hears(ALL.cart, showCart);
  bot.hears(ALL.orders, showMyOrders);
  bot.hears(ALL.profile, showProfile);
  bot.hears(ALL.about, showAbout);
  bot.hears(ALL.contacts, showContacts);
  bot.hears(ALL.editProfile, showEditProfile);
  bot.hears(ALL.changeLang, showLangSelect);
  bot.hears(ALL.back, async (ctx) => {
    if (ctx.session.isAdminMode) return openAdminPanel(ctx);
    return startHandler(ctx);
  });

  // Login button (shown on start screen if registered)
  bot.hears(
    ['🔑 Войти по коду', '🔑 Kod bilan kirish', '🔑 Login with code'],
    startLogin,
  );

  // ── Admin reply keyboard ───────────────────────────────────
  bot.hears(ALL.stats, showStats);
  bot.hears(ALL.cats, adminShowCats);
  bot.hears(ALL.products, showProducts);
  // Note: ALL.aOrders overlaps with ALL.orders above for "📦 Заказы" etc.
  // Telegraf matches first hears, so we need explicit admin check:
  bot.hears(['📦 Заказы', '📦 Buyurtmalar', '📦 Orders'], async (ctx) => {
    if (ctx.session.isAdminMode) return showOrders(ctx);
    return showMyOrders(ctx);
  });
  bot.hears(ALL.users, showUsers);
  bot.hears(ALL.settings, showSettings);
  bot.hears(ALL.adminMain, backToMain);

  // ── Inline — shop ──────────────────────────────────────────
  bot.action('shop_categories', showCategories);
  bot.action(/^cat_(\d+)$/, handleCategory);
  bot.action(/^cat_products_(\d+)_page_(\d+)$/, handleCategoryProductsPage);
  bot.action(/^product_(\d+)$/, showProduct);
  bot.action('search_products', searchProducts);

  // ── Inline — product qty ───────────────────────────────────
  bot.action(/^qty_minus_(\d+)$/, handleQtyMinus);
  bot.action(/^qty_plus_(\d+)$/, handleQtyPlus);
  bot.action(/^cart_add_(\d+)$/, handleAddToCart);

  // ── Inline — cart ──────────────────────────────────────────
  bot.action('cart_show', showCart);
  bot.action(/^cart_inc_(\d+)$/, cartIncrease);
  bot.action(/^cart_dec_(\d+)$/, cartDecrease);
  bot.action(/^cart_rm_(\d+)$/, cartRemove);
  bot.action('cart_clear', cartClear);
  bot.action('cart_checkout', startCartCheckout);

  // ── Inline — orders ────────────────────────────────────────
  bot.action(/^my_orders_page_(\d+)$/, showMyOrders);
  bot.action(/^order_cancel_(\d+)$/, cancelUserOrder);
  bot.action('confirm_order', confirmOrder);
  bot.action('cancel_order', cancelOrder);

  // ── Inline — profile ───────────────────────────────────────
  bot.action(/^edit_(name|phone|email)$/, handleEditProfileCallback);
  bot.action('profile_done', profileDone);

  // ── Inline — admin categories ──────────────────────────────
  bot.action('admin_categories', adminShowCats);
  bot.action('admin_cat_add_root', startAddRootCategory);
  bot.action(/^admin_cat_view_(\d+)$/, viewCategory);
  bot.action(/^admin_cat_add_sub_(\d+)$/, startAddSubCategory);
  bot.action(/^admin_cat_rename_(\d+)$/, startRenameCategory);
  bot.action(/^admin_cat_delete_(\d+)$/, confirmDeleteCategory);
  bot.action(/^admin_confirm_delete_category_(\d+)$/, executeDeleteCategory);

// ── Inline — admin products ────────────────────────────────
bot.action('admin_products', showProducts);
bot.action(/^admin_products_page_(\d+)$/, showProducts);

bot.action(/^admin_prod_view_(\d+)$/, viewProduct);

bot.action('admin_prod_add', startAddProduct);

bot.action(/^admin_prod_edit_(\d+)$/, startEditProduct);

bot.action(/^admin_prod_new_cat_(\d+)$/, pickRootCategory);
bot.action(/^admin_prod_new_subcat_(\d+)$/, pickSubCategory);

// ── Inline — admin product edit fields ─────────────────────

// EDIT PRODUCT NAME
bot.action(/^admin_prod_edit_title_(\d+)$/, async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();

  ctx.session.adminAction = {
    type: 'edit_product_title',
    productId,
  };

  await ctx.reply(ctx.t.prodEditTitle || 'Enter new name:');
});

// EDIT DESCRIPTION
bot.action(/^admin_prod_edit_desc_(\d+)$/, async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();

  ctx.session.adminAction = {
    type: 'edit_product_desc',
    productId,
  };

  await ctx.reply(ctx.t.prodEditDesc || 'Enter new description:');
});

// EDIT PRICE
bot.action(/^admin_prod_price_(\d+)$/, async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();

  ctx.session.adminAction = {
    type: 'edit_product_price',
    productId,
  };

  await ctx.reply(ctx.t.prodEditPrice || 'Enter new price:');
});

// EDIT STOCK
bot.action(/^admin_prod_stock_(\d+)$/, async (ctx) => {
  const productId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();

  ctx.session.adminAction = {
    type: 'edit_product_stock',
    productId,
  };

  await ctx.reply(ctx.t.prodEditStock || 'Enter new stock:');
});

// ── Photos ─────────────────────────────────────────────────
bot.action(/^admin_prod_photos_(\d+)$/, showPhotoMenu);
bot.action(/^admin_prod_see_photos_(\d+)$/, showPhotos);
bot.action(/^admin_prod_delete_photo_menu_(\d+)$/, showDeletePhotoMenu);
bot.action(/^admin_prod_delete_photo_(\d+)_(\d+)$/, deletePhoto);
bot.action(/^admin_prod_add_photo_(\d+)$/, startAddPhoto);

// ── Presets ────────────────────────────────────────────────
bot.action(/^admin_prod_preset_(\d+)$/, showPhotoPresets);
bot.action(/^admin_prod_use_preset_(\d+)_(\d+)$/, usePresetForProduct);

// ── Delete product ─────────────────────────────────────────
bot.action(/^admin_prod_delete_(\d+)$/, confirmDeleteProduct);
bot.action(/^admin_confirm_delete_product_(\d+)$/, executeDeleteProduct);

  // ── Inline — admin orders ──────────────────────────────────
  bot.action('admin_orders', showOrders);
  bot.action(/^admin_orders_page_(\d+)$/, showOrders);
  bot.action(/^admin_order_view_(\d+)$/, viewOrder);
  bot.action('admin_orders_filter_menu', showFilterMenu);
  bot.action(/^admin_orders_filter_(.+)$/, setFilter);
  bot.action(/^admin_order_status_(\d+)_(\w+)$/, changeOrderStatus);

  // ── Inline — admin users ───────────────────────────────────
  bot.action(/^admin_users_page_(\d+)$/, showUsers);
  bot.action(/^admin_user_view_(\d+)$/, viewUser);
  bot.action('admin_users_search', startSearchUsers);

  // ── Inline — admin settings ────────────────────────────────
  bot.action('admin_settings', showSettings);
  bot.action('admin_settings_subadmins', showSubAdmins);
  bot.action('admin_settings_requests', showAdminRequests);
  bot.action(/^admin_subadmin_approve_(\d+)$/, approveSubAdmin);
  bot.action(/^admin_subadmin_deny_(\d+)$/, denySubAdmin);
  bot.action(/^admin_subadmin_revoke_(\d+)$/, revokeSubAdmin);
  bot.action('admin_settings_presets', showPhotoPresetsSettings);
  bot.action('admin_preset_add', startAddPreset);
  bot.action(/^admin_preset_delete_(\d+)$/, deletePreset);

  bot.action('noop', (ctx) => ctx.answerCbQuery());

  // ── Contact (phone button) ─────────────────────────────────
  bot.on('contact', async (ctx) => {
    if (await handleContactEdit(ctx)) return;
    if (await handleRegistrationStep(ctx)) return;
  });

  // ── Location ───────────────────────────────────────────────
  bot.on('location', async (ctx) => {
    if (await handleCheckoutStep(ctx)) return;
    if (await handleRegistrationStep(ctx)) return;
  });

  // ── Photos ─────────────────────────────────────────────────
  bot.on('photo', async (ctx) => {
    if (await handlePresetPhoto(ctx)) return;
    if (await handleProductPhoto(ctx)) return;
  });

  // ── Text router ─────────────────────────────────────────────
  bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    // Done button (finish product photo upload)
    if (['✅ Готово', '✅ Tayyor', '✅ Done'].includes(text)) {
      if (await handleProductInput(ctx)) return;
    }

    // All known reply-keyboard texts (skip — handled by hears above)
    const knownButtons = [
      ...Object.values(ALL).flat(),
      '✅ Готово', '✅ Tayyor', '✅ Done',
    ];
    if (knownButtons.includes(text)) return;

    // Session routing
    if (await handleLoginCode(ctx)) return;
    if (await handleRegistrationStep(ctx)) return;
    if (await handleProfileEdit(ctx)) return;
    if (await handleCheckoutStep(ctx)) return;
    if (await handleSearchQuery(ctx)) return;
    if (await handleUserSearch(ctx)) return;
    if (await handleCategoryInput(ctx)) return;
    if (await handleAddProductStep(ctx)) return;
    if (await handlePresetName(ctx)) return;
    if (await handleProductInput(ctx)) return;
  });

  return bot;
}

module.exports = { createBot };
