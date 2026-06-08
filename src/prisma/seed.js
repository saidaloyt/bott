require('dotenv').config();
const prisma = require('../database/prisma');

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Создаём корневые категории
  const material = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'По материалу' },
  });

  const style = await prisma.category.upsert({
    where: { id: 2 },
    update: {},
    create: { name: 'По стилю' },
  });

  // Подкатегории материала
  const cotton = await prisma.category.create({
    data: { name: 'Хлопок', parentId: material.id },
  });
  const silk = await prisma.category.create({
    data: { name: 'Шёлк', parentId: material.id },
  });
  const jersey = await prisma.category.create({
    data: { name: 'Джерси', parentId: material.id },
  });

  // Подкатегории по цвету (под хлопком)
  const blackCotton = await prisma.category.create({
    data: { name: 'Чёрный', parentId: cotton.id },
  });
  const whiteCotton = await prisma.category.create({
    data: { name: 'Белый', parentId: cotton.id },
  });

  // Подкатегории стиля
  const classic = await prisma.category.create({
    data: { name: 'Классический', parentId: style.id },
  });
  const sport = await prisma.category.create({
    data: { name: 'Спортивный', parentId: style.id },
  });

  // Продукты
  await prisma.product.createMany({
    data: [
      {
        title: 'Чёрный хлопковый хиджаб',
        description: 'Мягкий, дышащий хлопковый хиджаб идеально подходит для повседневного использования. Лёгкий и комфортный.',
        price: 120000,
        stock: 50,
        photos: [],
        categoryId: blackCotton.id,
      },
      {
        title: 'Белый хлопковый хиджаб',
        description: 'Элегантный белый хиджаб из натурального хлопка. Подходит для особых случаев и повседневной носки.',
        price: 110000,
        stock: 30,
        photos: [],
        categoryId: whiteCotton.id,
      },
      {
        title: 'Шёлковый шарф-хиджаб',
        description: 'Роскошный шёлковый хиджаб с нежной текстурой. Придаёт образу изысканность и элегантность.',
        price: 250000,
        stock: 15,
        photos: [],
        categoryId: silk.id,
      },
      {
        title: 'Спортивный хиджаб из джерси',
        description: 'Эластичный хиджаб из джерси для активного образа жизни. Не сковывает движений, хорошо пропускает воздух.',
        price: 95000,
        stock: 40,
        photos: [],
        categoryId: sport.id,
      },
      {
        title: 'Классический хиджаб с вышивкой',
        description: 'Традиционный хиджаб с тонкой вышивкой по краям. Сочетает в себе элегантность и скромность.',
        price: 180000,
        stock: 20,
        photos: [],
        categoryId: classic.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ База данных успешно заполнена!');
  console.log(`   📁 Категорий: ${await prisma.category.count()}`);
  console.log(`   🧣 Продуктов: ${await prisma.product.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
