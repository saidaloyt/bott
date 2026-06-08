require('dotenv').config();

const config = {
  bot: {
    token: process.env.BOT_TOKEN,
    adminId: parseInt(process.env.ADMIN_ID),
    shopName: process.env.SHOP_NAME || 'Хиджаб Маркет',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV !== 'production',
  },
  pagination: {
    pageSize: 5,
  },
};

function validateConfig() {
  if (!config.bot.token) throw new Error('BOT_TOKEN обязателен в .env');
  if (!config.bot.adminId) throw new Error('ADMIN_ID обязателен в .env');
  if (!config.database.url) throw new Error('DATABASE_URL обязателен в .env');
}

validateConfig();

module.exports = config;
