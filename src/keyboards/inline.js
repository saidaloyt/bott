const { Markup } = require('telegraf');
const { formatStatus } = require('../utils/format');

/**
 * Клавиатура для категорий
 */
function categoriesKeyboard(categories, parentId = null) {
  const buttons = categories.map((cat) => [
    Markup.button.callback(`📁 ${cat.name}`, `cat_${cat.id}`),
  ]);

  if (parentId) {
    buttons.push([Markup.button.callback('⬅️ Назад', `cat_back_${parentId}`)]);
  } else {
    buttons.push([Markup.button.callback('⬅️ В главное меню', 'main_menu')]);
  }

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура для списка товаров
 */
function productsKeyboard(products, categoryId, page, totalPages) {
  const buttons = products.map((p) => [
    Markup.button.callback(`🧣 ${p.title} — ${Number(p.price).toLocaleString('ru-RU')} сум`, `product_${p.id}`),
  ]);

  const nav = [];
  if (page > 1) nav.push(Markup.button.callback('◀️', `products_${categoryId}_${page - 1}`));
  if (totalPages > 1) nav.push(Markup.button.callback(`${page}/${totalPages}`, 'noop'));
  if (page < totalPages) nav.push(Markup.button.callback('▶️', `products_${categoryId}_${page + 1}`));
  if (nav.length) buttons.push(nav);

  buttons.push([Markup.button.callback('⬅️ К категориям', `cat_${categoryId}`)]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура страницы товара
 */
function productPageKeyboard(productId, categoryId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🛒 Купить', `buy_${productId}`)],
    [Markup.button.callback('⬅️ Назад', `cat_${categoryId}`)],
  ]);
}

/**
 * Клавиатура для заказов администратора (пагинация + фильтры)
 */
function adminOrdersKeyboard(orders, page, totalPages, filter = '') {
  const buttons = orders.map((o) => [
    Markup.button.callback(
      `#${o.id} — ${formatStatus(o.status)} — ${Number(o.totalPrice).toLocaleString('ru-RU')} сум`,
      `admin_order_${o.id}`
    ),
  ]);

  const nav = [];
  if (page > 1) nav.push(Markup.button.callback('◀️', `admin_orders_${page - 1}_${filter}`));
  if (totalPages > 1) nav.push(Markup.button.callback(`${page}/${totalPages}`, 'noop'));
  if (page < totalPages) nav.push(Markup.button.callback('▶️', `admin_orders_${page + 1}_${filter}`));
  if (nav.length) buttons.push(nav);

  buttons.push([
    Markup.button.callback('🔍 Фильтр по статусу', 'admin_orders_filter'),
    Markup.button.callback('⬅️ Назад', 'admin_back'),
  ]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура смены статуса заказа
 */
function orderStatusKeyboard(orderId, currentStatus) {
  const statuses = [
    { key: 'pending',    label: '⏳ Ожидает' },
    { key: 'delivering', label: '🚚 Доставляется' },
    { key: 'delivered',  label: '✅ Доставлен' },
    { key: 'cancelled',  label: '❌ Отменён' },
  ];

  const buttons = statuses
    .filter((s) => s.key !== currentStatus)
    .map((s) => [Markup.button.callback(s.label, `set_status_${orderId}_${s.key}`)]);

  buttons.push([Markup.button.callback('⬅️ Назад к заказам', 'admin_orders_1_')]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура категорий для администратора
 */
function adminCategoriesKeyboard(categories, parentId = null) {
  const buttons = categories.map((cat) => [
    Markup.button.callback(`📁 ${cat.name}`, `admin_cat_view_${cat.id}`),
  ]);

  buttons.push([Markup.button.callback('➕ Добавить категорию', `admin_cat_add_${parentId || 0}`)]);

  if (parentId) {
    buttons.push([Markup.button.callback('⬅️ Назад', `admin_cat_parent_${parentId}`)]);
  } else {
    buttons.push([Markup.button.callback('⬅️ В меню', 'admin_back')]);
  }

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура управления конкретной категорией
 */
function adminCategoryActionsKeyboard(category) {
  const buttons = [
    [Markup.button.callback('✏️ Переименовать', `admin_cat_rename_${category.id}`)],
    [Markup.button.callback('📂 Подкатегории', `admin_cat_children_${category.id}`)],
    [Markup.button.callback('🗑 Удалить', `admin_cat_delete_${category.id}`)],
    [Markup.button.callback('⬅️ Назад', category.parentId ? `admin_cat_children_${category.parentId}` : 'admin_categories')],
  ];

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура для товаров администратора
 */
function adminProductsKeyboard(products, page, totalPages) {
  const buttons = products.map((p) => [
    Markup.button.callback(`🧣 ${p.title}`, `admin_product_${p.id}`),
  ]);

  const nav = [];
  if (page > 1) nav.push(Markup.button.callback('◀️', `admin_products_${page - 1}`));
  if (totalPages > 1) nav.push(Markup.button.callback(`${page}/${totalPages}`, 'noop'));
  if (page < totalPages) nav.push(Markup.button.callback('▶️', `admin_products_${page + 1}`));
  if (nav.length) buttons.push(nav);

  buttons.push([
    Markup.button.callback('➕ Добавить товар', 'admin_product_add'),
    Markup.button.callback('⬅️ Назад', 'admin_back'),
  ]);

  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура управления конкретным товаром
 */
function adminProductActionsKeyboard(productId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('✏️ Редактировать название', `admin_prod_edit_title_${productId}`)],
    [Markup.button.callback('📝 Редактировать описание', `admin_prod_edit_desc_${productId}`)],
    [Markup.button.callback('💰 Изменить цену', `admin_prod_edit_price_${productId}`)],
    [Markup.button.callback('📦 Изменить остаток', `admin_prod_edit_stock_${productId}`)],
    [Markup.button.callback('📸 Добавить фото', `admin_prod_add_photo_${productId}`)],
    [Markup.button.callback('🗑 Удалить товар', `admin_prod_delete_${productId}`)],
    [Markup.button.callback('⬅️ Назад', 'admin_products_1')],
  ]);
}

/**
 * Клавиатура фильтра статусов
 */
function orderFilterKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('⏳ Ожидает', 'admin_orders_1_pending')],
    [Markup.button.callback('🚚 Доставляется', 'admin_orders_1_delivering')],
    [Markup.button.callback('✅ Доставлен', 'admin_orders_1_delivered')],
    [Markup.button.callback('❌ Отменён', 'admin_orders_1_cancelled')],
    [Markup.button.callback('📋 Все заказы', 'admin_orders_1_')],
    [Markup.button.callback('⬅️ Назад', 'admin_back')],
  ]);
}

/**
 * Клавиатура выбора категории для нового товара
 */
function selectCategoryKeyboard(categories, action) {
  const buttons = categories.map((cat) => [
    Markup.button.callback(cat.name, `${action}_${cat.id}`),
  ]);
  buttons.push([Markup.button.callback('❌ Отмена', 'admin_back')]);
  return Markup.inlineKeyboard(buttons);
}

/**
 * Клавиатура пагинации пользователей
 */
function adminUsersKeyboard(users, page, totalPages) {
  const buttons = users.map((u) => [
    Markup.button.callback(`👤 ${u.fullName || u.telegramId}`, `admin_user_${u.id}`),
  ]);

  const nav = [];
  if (page > 1) nav.push(Markup.button.callback('◀️', `admin_users_${page - 1}`));
  if (totalPages > 1) nav.push(Markup.button.callback(`${page}/${totalPages}`, 'noop'));
  if (page < totalPages) nav.push(Markup.button.callback('▶️', `admin_users_${page + 1}`));
  if (nav.length) buttons.push(nav);

  buttons.push([Markup.button.callback('⬅️ Назад', 'admin_back')]);

  return Markup.inlineKeyboard(buttons);
}

module.exports = {
  categoriesKeyboard,
  productsKeyboard,
  productPageKeyboard,
  adminOrdersKeyboard,
  orderStatusKeyboard,
  adminCategoriesKeyboard,
  adminCategoryActionsKeyboard,
  adminProductsKeyboard,
  adminProductActionsKeyboard,
  orderFilterKeyboard,
  selectCategoryKeyboard,
  adminUsersKeyboard,
};
