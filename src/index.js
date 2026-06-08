require('dotenv').config();
const { createBot } = require('./bot');
const logger = require('./utils/logger');

async function main() {
  logger.info('🚀 Запуск бота...');

  const bot = await createBot();

  // Graceful shutdown
  process.once('SIGINT', () => {
    logger.info('⛔ Остановка бота (SIGINT)...');
    bot.stop('SIGINT');
  });
  process.once('SIGTERM', () => {
    logger.info('⛔ Остановка бота (SIGTERM)...');
    bot.stop('SIGTERM');
  });

  await bot.launch();
  logger.info(`✅ Бот запущен: @${bot.botInfo.username}`);
}

main().catch((error) => {
  logger.error('❌ Критическая ошибка запуска', { error: error.message });
  process.exit(1);
});
