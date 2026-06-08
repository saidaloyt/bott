const { Markup } = require('telegraf');

const mainMenu = Markup.keyboard([
  ['🛍 Магазин', '📦 Мои заказы'],
  ['👤 Мой профиль', 'ℹ️ О нас'],
  ['📞 Контакты'],
]).resize();

const backButton = Markup.keyboard([['⬅️ Назад']]).resize();

const cancelButton = Markup.keyboard([['❌ Отмена']]).resize();

const backAndCancelButtons = Markup.keyboard([
  ['⬅️ Назад', '❌ Отмена'],
]).resize();

const sharePhoneButton = Markup.keyboard([
  [Markup.button.contactRequest('📱 Поделиться номером телефона')],
  ['⬅️ Назад'],
]).resize();

const confirmOrderKeyboard = Markup.keyboard([
  ['✅ Подтвердить заказ'],
  ['❌ Отменить'],
]).resize();

const adminMenu = Markup.keyboard([
  ['📊 Статистика', '📂 Категории'],
  ['🧣 Товары', '📦 Заказы'],
  ['👥 Пользователи', '⚙️ Настройки'],
  ['🏠 Главное меню'],
]).resize();

module.exports = {
  mainMenu,
  backButton,
  cancelButton,
  backAndCancelButtons,
  sharePhoneButton,
  confirmOrderKeyboard,
  adminMenu,
};
