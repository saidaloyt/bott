const { Markup } = require('telegraf');

function adminMenuKeyboard(t) {
  return Markup.keyboard([
    [t.adminMenuStats, t.adminMenuCats],
    [t.adminMenuProducts, t.adminMenuOrders],
    [t.adminMenuUsers, t.adminMenuSettings],
    [t.adminMenuMain],
  ]).resize();
}

// Universal cancel for admin — works across all languages
const adminCancelKeyboard = Markup.keyboard([
  ['❌ Отмена / Cancel / Bekor qilish'],
]).resize();

function settingsKeyboard(t) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.settingsModerators, 'admin_settings_subadmins')],
    [Markup.button.callback(t.settingsPresets, 'admin_settings_presets')],
    [Markup.button.callback(t.settingsRequests, 'admin_settings_requests')],
  ]);
}

function categoryActionsKeyboard(categoryId, parentId, t) {
  const backData = parentId ? `admin_cat_view_${parentId}` : 'admin_categories';
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.renameCategory, `admin_cat_rename_${categoryId}`)],
    [Markup.button.callback(t.addSubcategory, `admin_cat_add_sub_${categoryId}`)],
    [Markup.button.callback(t.deleteCategory, `admin_cat_delete_${categoryId}`)],
    [Markup.button.callback(t.back, backData)],
  ]);
}

function productActionsKeyboard(productId, isSubAdmin, t) {
  const buttons = [
    [Markup.button.callback(t.editBtn || '✏️ Edit', `admin_prod_edit_${productId}`)],
    [
      Markup.button.callback(t.addPhotoBtn || '📸 Add Photo', `admin_prod_photos_${productId}`),
      Markup.button.callback(t.editPhotos || '🖼 Edit Photo', `admin_prod_photos_${productId}`)
    ],
    [
      Markup.button.callback(t.stockBtn || '📦 Stock', `admin_prod_stock_${productId}`),
      Markup.button.callback(t.priceBtn || '💰 Price', `admin_prod_price_${productId}`),
    ],
  ];

  if (!isSubAdmin) {
    buttons.push([
      Markup.button.callback(t.deleteBtn || '🗑 Delete', `admin_prod_delete_${productId}`)
    ]);
  }

  buttons.push([
    Markup.button.callback(t.back || '⬅️ Back', 'admin_products')
  ]);

  return Markup.inlineKeyboard(buttons);
}

function productActionsKeyboard(productId, isSubAdmin, t) {
  const buttons = [
    [Markup.button.callback(t.editBtn, `admin_prod_edit_${productId}`)],
    [
      Markup.button.callback(t.addPhotoBtn, `admin_prod_photos_${productId}`),
    ],
    [
      Markup.button.callback(t.stockBtn, `admin_prod_stock_${productId}`),
      Markup.button.callback(t.priceBtn, `admin_prod_price_${productId}`),
    ],
  ];

  if (!isSubAdmin) {
    buttons.push([
      Markup.button.callback(t.deleteBtn, `admin_prod_delete_${productId}`)
    ]);
  }

  buttons.push([
    Markup.button.callback(t.back, 'admin_products')
  ]);

  return Markup.inlineKeyboard(buttons);
}

function editProductKeyboard(productId, t) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(`📝 ${t.profileName}`, `admin_prod_edit_title_${productId}`)],
    [Markup.button.callback(t.editDesc || '📄 Edit Description', `admin_prod_edit_desc_${productId}`)],
    [Markup.button.callback(t.priceBtn, `admin_prod_price_${productId}`)],
    [Markup.button.callback(t.stockBtn, `admin_prod_stock_${productId}`)],
    [Markup.button.callback(t.back, `admin_prod_view_${productId}`)],
  ]);
}

function orderActionsKeyboard(orderId, currentStatus, t) {
  const statuses = ['pending', 'delivering', 'delivered', 'cancelled'];
  const statusButtons = statuses
    .filter((s) => s !== currentStatus)
    .map((s) => Markup.button.callback(t.status[s], `admin_order_status_${orderId}_${s}`));

  return Markup.inlineKeyboard([
    statusButtons,
    [Markup.button.callback(t.back, 'admin_orders_page_1')],
  ]);
}

function orderFiltersKeyboard(t) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(t.status.pending, 'admin_orders_filter_pending'),
      Markup.button.callback(t.status.delivering, 'admin_orders_filter_delivering'),
    ],
    [
      Markup.button.callback(t.status.delivered, 'admin_orders_filter_delivered'),
      Markup.button.callback(t.status.cancelled, 'admin_orders_filter_cancelled'),
    ],
    [Markup.button.callback(t.ordersAll, 'admin_orders_filter_all')],
  ]);
}

function confirmDeleteKeyboard(entityType, entityId, backData, t) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.yes, `admin_confirm_delete_${entityType}_${entityId}`)],
    [Markup.button.callback(t.back, backData)],
  ]);
}

module.exports = {
  adminMenuKeyboard,
  adminCancelKeyboard,
  settingsKeyboard,
  categoryActionsKeyboard,
  productActionsKeyboard,
  orderActionsKeyboard,
  orderFiltersKeyboard,
  confirmDeleteKeyboard,
};
