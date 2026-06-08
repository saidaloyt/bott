const config = require('../config');
const { formatDate } = require('../utils/format');
const { getT } = require('../utils/i18n');
const logger = require('../utils/logger');
const { prisma } = require('../config/database');
const { productTitle } = require('../utils/localized');

class NotificationService {
  constructor() { this.bot = null; }
  setBot(bot) { this.bot = bot; }

  async notifyAdminNewOrder(order, cardLastEight) {
    if (!this.bot) return;

    // Get admin's language
    let adminLang = 'ru';
    try {
      const adminUser = await prisma.user.findFirst({
        where: { telegramId: String(config.bot.adminId) },
      });
      if (adminUser?.language) adminLang = adminUser.language;
    } catch (_) {}

    const t = getT(adminLang);

    let productsText = '';
    order.items.forEach((item) => {
      productsText += `• ${productTitle(item.product, adminLang)} × ${item.quantity}\n`;
    });

    const message = t.notifyNewOrder(order, productsText, cardLastEight);

    try {
      await this.bot.telegram.sendMessage(config.bot.adminId, message, { parse_mode: 'HTML' });
      // Send native Telegram location pin if coordinates were saved
      if (order.deliveryLatitude && order.deliveryLongitude) {
        await this.bot.telegram.sendLocation(
          config.bot.adminId,
          order.deliveryLatitude,
          order.deliveryLongitude
        );
      }
    } catch (error) {
      logger.error('Admin notification error', { error: error.message });
    }
  }

  async notifyUserStatusChange(order) {
    if (!this.bot) return;
    const telegramId = order.user.telegramId;
    const userLang = order.user.language || 'ru';
    const t = getT(userLang);
    const statusLabel = t.status[order.status] || order.status;
    const message = t.notifyStatusChange(order.id, statusLabel);

    try {
      await this.bot.telegram.sendMessage(telegramId, message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('User notification error', { telegramId, error: error.message });
    }
  }
}

module.exports = new NotificationService();
