const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ База данных подключена');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
}

module.exports = { prisma, connectDatabase };
