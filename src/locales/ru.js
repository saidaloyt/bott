module.exports = {
  // Language
  chooseLanguage: '🌐 Выберите язык:',
  langSet: '✅ Язык: Русский',

  // Onboarding
  regStep1: '📝 <b>Регистрация — Шаг 1/3</b>\n\nВведите ваше <b>ФИ</b> (Два слова):\n\n<i>Пример: Иванов Иван</i>',
  regStep2: '📱 <b>Регистрация — Шаг 2/3</b>\n\nОтправьте ваш <b>номер телефона</b>:',
  regStep3: '📧 <b>Регистрация — Шаг 3/3</b>\n\nВведите ваш <b>Gmail адрес</b>:',
  regDone: (name, code) =>
    `🎉 <b>Добро пожаловать, ${name}!</b>\n\n🔑 <b>Ваш код для входа:</b> <code>${code}</code>\n\n⚠️ Сохраните код — он нужен для входа с другого устройства.`,
  invalidName: '❌ ФИО должно состоять ровно из 2 слов.\n\n<i>Пример: Иванов Иван</i>',
  invalidPhone: '❌ Некорректный номер телефона. Попробуйте ещё раз.',
  invalidEmail: '❌ Некорректный Gmail. Введите адрес формата example@gmail.com',
  invalidCard: '❌ Неверный номер карты. Принимаются только карты Узбекистана (Uzcard, Humo, Visa, Mastercard).',
  invalidAddress: '❌ Адрес слишком короткий.',
  authPrompt: 'Выберите, как продолжить:',
  registerBtn: '📝 Регистрация',

  // Login
  loginBtn: '🔑 Войти по коду',
  loginPrompt: '🔑 <b>Вход</b>\n\nВведите ваш 6-значный код:',
  loginSuccess: (name) => `✅ С возвращением, <b>${name}</b>!`,
  loginFail: '❌ Неверный код. Попробуйте ещё раз.',

  // Buttons
  sharePhone: '📱 Отправить номер телефона',
  cancel: '❌ Отмена',
  back: '⬅️ Назад',
  done: '✅ Готово',
  skip: '⏩ Пропустить',
  enterManual: '⌨️ Ввести вручную',
  sendLocation: '📍 Отправить геолокацию',
  confirm: '✅ Подтвердить заказ',
  cancelOrderBtn: '❌ Отменить',
  yes: '✅ Да, удалить',
  no: '❌ Нет',

  // Main menu
  menuShop: '🛍 Магазин',
  menuCart: '🛒 Корзина',
  menuOrders: '📦 Мои заказы',
  menuProfile: '👤 Профиль',
  menuAbout: 'ℹ️ О нас',
  menuContacts: '📞 Контакты',

  // Shop
  shopTitle: '🛍 <b>Магазин</b>\n\nВыберите категорию:',
  chooseSubcat: (path) => `📂 <b>${path}</b>\n\nВыберите подкатегорию:`,
  productsIn: (path, total, page, pages) => `🧣 <b>${path}</b>\n\nТоваров: ${total} | Стр. ${page}/${pages}`,
  productsInCategory: (path, total) => `🧣 <b>${path}</b>\n\nТоваров: ${total}`,
  noProducts: '😔 В этой категории пока нет товаров.',
  noCategories: '😔 Категории ещё не добавлены.',
  categoryNotFound: '❌ Категория не найдена.',
  search: '🔍 Поиск',
  searchPrompt: '🔍 Введите название для поиска:',
  searchEmpty: (q) => `😔 По запросу "<b>${q}</b>" ничего не найдено.`,
  searchResults: (q, n) => `🔍 Результаты: "<b>${q}</b>" (${n} шт.)`,

  // Product
  productInfo: (p, qty) =>
    `🧣 <b>${p.title}</b>\n\n📄 ${p.description || 'Описание отсутствует'}\n\n💰 <b>Цена:</b> ${p.price.toLocaleString()} сум\n📦 <b>В наличии:</b> ${p.stock} шт.\n🔢 <b>Количество:</b> ${qty}`,
  productCard: (p) =>
    `🧣 <b>${p.title}</b>\n\n📄 ${p.description || 'Описание отсутствует'}\n\n💰 <b>Цена:</b> ${p.price.toLocaleString()} сум\n📦 <b>В наличии:</b> ${p.stock} шт.`,
  viewProduct: '👀 Посмотреть товар',
  addToCart: '🛒 В корзину',
  outOfStock: '❌ Товар закончился.',
  productNotFound: '❌ Товар не найден.',

  // Cart
  cartEmpty: '🛒 <b>Корзина пуста</b>\n\nПерейдите в магазин, чтобы добавить товары.',
  cartTitle: (lines) => `🛒 <b>Корзина</b>\n━━━━━━━━━━━━━━\n${lines}`,
  cartTotal: (sum) => `━━━━━━━━━━━━━━\n💰 <b>Итого: ${sum.toLocaleString()} сум</b>`,
  cartAdded: (title) => `✅ "${title}" добавлен в корзину!`,
  cartUpdated: '✅ Корзина обновлена.',
  cartCleared: '🗑 Корзина очищена.',
  checkout: '✅ Оформить заказ',
  clearCart: '🗑 Очистить корзину',

  // Checkout
  checkoutSummary: '🛒 <b>Ваш заказ:</b>',
  checkoutEmail: 'Введите <b>email</b> или пропустите:',
  checkoutAddress: 'Укажите <b>адрес доставки</b>:',
  checkoutLocation: '📍 Теперь отправьте <b>вашу геолокацию</b> (через кнопку Telegram):',
  checkoutCard: 'Введите <b>номер карты</b> (16 цифр):',
  checkoutConfirm: '✅ <b>Подтверждение заказа</b>',
  orderPlaced: (id) => `🎉 <b>Заказ #${id} оформлен!</b>\n\nМы свяжемся с вами для подтверждения.`,
  sessionExpired: '❌ Сессия истекла. Начните заново.',

  // Orders
  myOrders: '📦 <b>Мои заказы</b>',
  noOrders: '📦 У вас пока нет заказов.',
  orderCancelled: (id) => `✅ Заказ #${id} отменён.`,
  cannotCancel: '❌ Можно отменить только заказы со статусом "Ожидает".',

  // Notification — order to admin
  notifyNewOrder: (order, productsText, cardLastEight) =>
    `🛒 <b>НОВЫЙ ЗАКАЗ #${order.id}</b>\n\n` +
    `👤 <b>Имя:</b> ${order.user.fullName}\n` +
    `📞 <b>Телефон:</b> ${order.user.phone}\n` +
    `📧 <b>Gmail:</b> ${order.user.email || '—'}\n` +
    `📍 <b>Адрес:</b> ${order.user.address || '—'}\n` +
    (cardLastEight ? `💳 <b>Карта:</b> **** **** ${cardLastEight.slice(0,4)} ${cardLastEight.slice(4)}\n` : '') +
    `\n🧣 <b>Товары:</b>\n${productsText}\n` +
    `💰 <b>Итого:</b> ${order.totalPrice.toLocaleString()} сум`,

  // Notification — status to user
  notifyStatusChange: (orderId, status) =>
    `📦 <b>Статус заказа #${orderId} изменён</b>\n\n📋 <b>Статус:</b> ${status}`,

  // Profile
  profileTitle: '👤 <b>Мой профиль</b>',
  profileName: 'Имя',
  profilePhone: 'Телефон',
  profileEmail: 'Email',
  profileCode: 'Код входа',
  profileOrders: 'Заказов',
  profileLang: 'Язык',
  profileDate: 'Дата регистрации',
  editProfile: '✏️ Редактировать',
  changeLang: '🌐 Язык',
  profileUpdated: '✅ Профиль обновлён!',
  editName: '👤 Имя',
  editPhone: '📱 Телефон',
  editEmail: '📧 Email',
  editDone: '✅ Готово',

  // About
  aboutTitle: 'ℹ️ <b>О нас</b>',
  aboutBody:
    '🧣 <b>Hijab Market</b> — надёжный магазин хиджабов и платков из натуральных материалов.\n\n' +
    '✨ <b>Почему выбирают нас:</b>\n• Натуральные ткани премиум качества\n• Быстрая доставка по всему Узбекистану\n• Гарантия качества\n• Оплата при получении\n\n' +
    '📞 <b>Телефон:</b> +998 90 123 45 67\n📱 <b>WhatsApp:</b> +998 90 123 45 67\n✈️ <b>Telegram:</b> @hijab_market_uz\n📸 <b>Instagram:</b> @hijabmarket.uz\n📧 <b>Email:</b> info@hijabmarket.uz\n📍 <b>Адрес:</b> г. Ташкент, ул. Навои, 1\n\n🕐 <b>Пн–Пт:</b> 9:00–18:00 | <b>Сб:</b> 10:00–16:00',
  contactsTitle: '📞 <b>Контакты</b>',
  contactsBody:
    '📱 +998 90 123 45 67\n✈️ @hijab_market_uz\n📸 @hijabmarket.uz\n📧 info@hijabmarket.uz\n📍 г. Ташкент, ул. Навои, 1\n\n🕐 Пн–Пт: 9:00–18:00 | Сб: 10:00–16:00',

  // Admin — general
  adminWelcome: (role) => `⚙️ <b>Панель управления</b>\n\n${role}`,
  adminRoleMain: '👑 Администратор',
  adminRoleSub: '👮 Модератор',
  noAccess: '⛔️ У вас нет доступа.',
  registerFirst: '⚠️ Сначала зарегистрируйтесь (/start).',
  alreadyModerator: '✅ У вас уже есть права модератора. Используйте /admin',
  requestPending: '⏳ Ваша заявка уже на рассмотрении.',
  requestSent: '✅ Заявка отправлена! Вы получите уведомление после рассмотрения.',
  requestApproved: '✅ Ваша заявка одобрена!\n\nОткройте панель: /admin',
  newModeratorRequest: (user) =>
    `📋 <b>Новая заявка на модератора</b>\n\n👤 ${user.fullName}\n📱 ${user.phone}\n🆔 ID: ${user.id}\n\nРассмотрите в /admin → ⚙️ Настройки → Заявки`,

  // Admin — menu
  adminMenuStats: '📊 Статистика',
  adminMenuCats: '📂 Категории',
  adminMenuProducts: '🧣 Товары',
  adminMenuOrders: '📦 Заказы',
  adminMenuUsers: '👥 Пользователи',
  adminMenuSettings: '⚙️ Настройки',
  adminMenuMain: '🏠 Главное меню',

  // Admin — stats
  statsTitle: '📊 <b>Статистика</b>',
  statsUsers: 'Пользователей',
  statsOrders: 'Всего заказов',
  statsRevenue: 'Выручка',
  statsToday: 'Заказов сегодня',
  statsMonth: 'Заказов за месяц',
  statsTopProduct: 'Популярный товар',
  statsNoData: 'нет данных',
  statsSold: (n) => `(${n} продано)`,

  // Admin — categories
  catsTitle: '📂 <b>Категории</b>',
  catsEmpty: 'Категорий нет.',
  addCategory: '➕ Добавить категорию',
  addSubcategory: '➕ Добавить подкатегорию',
  renameCategory: '✏️ Переименовать',
  deleteCategory: '🗑 Удалить',
  categoryCreated: (name) => `✅ Категория "${name}" создана!`,
  categoryRenamed: (name) => `✅ Переименовано в "${name}"!`,
  categoryDeleted: '✅ Категория удалена.',
  catNamePrompt: '📝 Введите название категории:',
  catNameUzPrompt: '📝 Введите название категории на узбекском (латиница):',
  catNameRuPrompt: '📝 Введите название категории на русском:',
  catNameEnPrompt: '📝 Введите название категории на английском:',
  catSubNamePrompt: (parent) => `📝 Название подкатегории для "${parent}":`,
  catRenamePrompt: (old) => `✏️ Текущее: <b>${old}</b>\n\nНовое название:`,
  catDeleteConfirm: (name, warn) => `🗑 Удалить категорию "<b>${name}</b>"?${warn}`,
  catHasChildren: '\n⚠️ Все подкатегории будут удалены!',
  catHasProducts: '\n⚠️ Товары потеряют категорию!',
  catNameTooShort: '❌ Название минимум 2 символа.',
  catSubcategories: 'Подкатегорий',
  catHasProductsLabel: 'Есть товары',
  catNoProductsLabel: 'Нет товаров',

  // Admin — products
  prodsTitle: (total, page, pages) => `🧣 <b>Товары</b> (${total}) — стр. ${page}/${pages}`,
  prodsEmpty: '🧣 <b>Товары</b>\n\nТоваров пока нет.',
  addProduct: '➕ Добавить товар',
  prodStep1: '➕ <b>Новый товар</b>\n\nШаг 1: Выберите <b>категорию</b>:',
  photoManagement: '🖼 Управление фото',
  addPhoto: '➕ Добавить фото',
  deletePhoto: '❌ Удалить фото',
  seePhotos: '👁 Посмотреть фото',
  noPhotos: '❌ Нет фотографий',
  choosePhotoToDelete: '🗑 Выберите фото для удаления',
  deletePhotoBtn: (i) => `❌ Удалить фото ${i}`,
  photoDeleted: '✅ Фото удалено',
  prodStep2: (parent) => `Шаг 2: Выберите <b>подкатегорию</b> в "${parent}":`,
  prodStep3: 'Шаг 3: Введите <b>название товара</b>:',
  prodStep4: 'Шаг 4: Введите <b>описание</b> (или «-» чтобы пропустить):',
  prodStep5: 'Шаг 5: Введите <b>цену</b> (только цифры):',
  prodStep6: 'Шаг 6: Введите <b>количество</b> на складе:',
  prodTitleUzPrompt: 'Введите название товара на узбекском (латиница):',
  prodTitleRuPrompt: 'Введите название товара на русском:',
  prodTitleEnPrompt: 'Введите название товара на английском:',
  prodDescUzPrompt: 'Введите описание на узбекском (латиница) или "-":',
  prodDescRuPrompt: 'Введите описание на русском или "-":',
  prodDescEnPrompt: 'Введите описание на английском или "-":',
  prodCreated: (title) => `✅ Товар "${title}" добавлен! Добавьте фото:`,
  prodEdit: '✏️ Что редактируем?',
  prodEditTitle: '✏️ Новое название:',
  prodEditDesc: '✏️ Новое описание:',
  prodEditPrice: '💰 Новая цена (только цифры):',
  prodEditStock: '📦 Новое количество:',
  prodTitleUpdated: '✅ Название обновлено!',
  prodDescUpdated: '✅ Описание обновлено!',
  prodPriceUpdated: (p) => `✅ Цена: ${p.toLocaleString()}`,
  prodStockUpdated: (n) => `✅ Остаток: ${n} шт.`,
  prodDeleted: '✅ Товар удалён.',
  prodDeleteConfirm: (title) => `🗑 Удалить товар "<b>${title}</b>"?`,
  prodNameTooShort: '❌ Название минимум 2 символа.',
  prodInvalidPrice: '❌ Введите корректную цену.',
  prodInvalidStock: '❌ Введите корректное количество.',
  prodCategoryFirst: '❌ Сначала создайте категорию.',
  prodPhotoPrompt: '📸 Отправьте фото товара. Напишите «Готово» когда закончите.',
  prodPhotoDone: 'Готово',
  prodPhotoAdded: '✅ Фото добавлено! Отправьте ещё или напишите «Готово».',
  prodPhotoFinished: '✅ Загрузка фото завершена.',
  prodNoPresets: '🖼 Нет пресетов. Добавьте их в ⚙️ Настройки → Фото-пресеты.',
  prodPresetAdded: (name) => `✅ Фото из пресета "${name}" добавлено.`,
  editBtn: '✏️ Редактировать',
  addPhotoBtn: '📸 Добавить фото',
  presetsBtn: '🖼 Редактировать фото',
  stockBtn: '📦 Остаток',
  priceBtn: '💰 Цена',
  deleteBtn: '🗑 Удалить',

  // Admin — orders
  ordersTitle: (label, total, page, pages) => `📦 <b>Заказы</b> — ${label} (${total}) — стр. ${page}/${pages}`,
  ordersEmpty: (label) => `📦 <b>Заказы</b> — ${label}\n\nЗаказов нет.`,
  ordersAll: '📋 Все',
  filterBtn: '🔽 Фильтры',
  orderDetail: (order, productsText, t) =>
    `🔖 <b>Заказ #${order.id}</b>\n\n👤 ${order.user?.fullName}\n📱 ${order.user?.phone}\n📧 ${order.user?.email || '—'}\n📍 ${order.user?.address || '—'}\n` +
    (order.cardLastFour ? `💳 **** **** **** ${order.cardLastFour}\n` : '') +
    `\n🧣 <b>Товары:</b>\n${productsText}\n💰 <b>Итого: ${order.totalPrice.toLocaleString()}</b>\n📋 ${t.status[order.status] || order.status}`,
  orderStatusChanged: (id, status) => `✅ Заказ #${id} → ${status}`,
  orderNotFound: '❌ Заказ не найден.',

  // Admin — users
  usersTitle: (total, page, pages) => `👥 <b>Пользователи</b> (${total}) — стр. ${page}/${pages}`,
  usersEmpty: '👥 Пользователей пока нет.',
  usersSearch: '🔍 Поиск',
  usersSearchPrompt: '🔍 Введите имя, телефон или email:',
  usersNotFound: (q) => `😔 По запросу "${q}" никого не найдено.`,
  usersFound: (n) => `🔍 Найдено: ${n}`,
  userProfile: '👤 <b>Профиль пользователя</b>',
  userRoleAdmin: '👑 Администратор',
  userRoleMod: '👮 Модератор',
  userRoleCustomer: '👤 Покупатель',
  userRecentOrders: 'Последние заказы',
  userOrdersCount: 'Заказов',
  userRegistered: 'Зарегистрирован',

  // Admin — settings
  settingsTitle: '⚙️ <b>Настройки</b>\n\nВыберите раздел:',
  settingsModerators: '👮 Управление модераторами',
  settingsPresets: '🖼 Фото-пресеты',
  settingsRequests: '📋 Заявки',
  modsTitle: (n) => `👮 <b>Модераторы</b> (${n})`,
  modsEmpty: 'Модераторов пока нет.',
  modRemove: (name) => `❌ Убрать: ${name}`,
  reqTitle: (n) => `📋 <b>Заявки на модератора</b> (${n})`,
  reqEmpty: '📋 <b>Заявки</b>\n\nНовых заявок нет.',
  reqApprove: (name) => `✅ ${name}`,
  reqReject: '❌ Отклонить',
  reqApproved: '✅ Одобрено',
  reqRejected: '❌ Отклонено',
  reqRemoved: '✅ Удалён',
  presetsTitle: (n) => `🖼 <b>Фото-пресеты</b> (${n})`,
  presetsEmpty: 'Пресетов нет. Нажмите «Добавить» чтобы создать.',
  presetAdd: '➕ Добавить пресет',
  presetDelete: (name) => `🗑 ${name}`,
  presetDeleted: '✅ Пресет удалён.',
  presetPhotoPrompt: '📸 Отправьте фото для пресета:',
  presetNamePrompt: '📝 Введите название пресета:',
  presetNameEmpty: '❌ Введите название.',
  presetCreated: (name) => `✅ Пресет "${name}" добавлен!`,

  // product edit buttons
  editName: '✏️ Редактировать название',
  editDesc: '📄 Редактировать описание',
  editPrice: '💰 Редактировать цену',
  editStock: '📦 Редактировать количество',
  editPhotos: '📸 Редактировать фото',
  back: '⬅️ Назад',

  // Pagination
  pageNext: 'Вперёд ➡️',
  pagePrev: '⬅️ Назад',

  // Status labels
  status: {
    pending: '⏳ Ожидает',
    delivering: '🚚 Доставляется',
    delivered: '✅ Доставлен',
    cancelled: '❌ Отменён',
  },

  // Generic
  errorGeneric: (e) => `❌ Ошибка: ${e}`,
  errorOccurred: '😔 Произошла ошибка. Пожалуйста, попробуйте ещё раз или напишите /start',
  validationFailed: '❌ Ошибка проверки. Проверьте введённые данные.',
  checkoutError: '❌ Ошибка оформления заказа. Попробуйте ещё раз.',
  insufficientStock: '❌ Недостаточно товара на складе.',
  success: '✅ Готово!',
  deleted: '✅ Удалено.',
};
