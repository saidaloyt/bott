const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: 'Джерси', subs: ['Черный','Белый','Бежевый','Коричневый','Серый','Розовый','Оливковый','Бордовый'],
  },
  {
    name: 'Хлопок', subs: ['Черный','Белый','Кремовый','Коричневый','Синий','Голубой','Зеленый'],
  },
  {
    name: 'Шифон', subs: ['Черный','Белый','Кремовый','Темно-синий','Лавандовый','Бордовый','Розовый'],
  },
  {
    name: 'Шелк', subs: ['Черный','Белый','Золотой','Серебряный','Изумрудный','Бордовый'],
  },
  {
    name: 'Сатин', subs: ['Черный','Белый','Бежевый','Шоколадный','Серый','Темно-зеленый'],
  },
  {
    name: 'Премиум', subs: ['Черный','Белый','Золотой','Серебряный','Изумрудный','Бордовый','Темно-синий'],
  },
];

const DEMO_PRODUCTS = [
  { titleTpl: (mat, color) => `${color} хиджаб из ${mat}`, descTpl: (mat, color) => `Элегантный ${color.toLowerCase()} хиджаб из натурального ${mat.toLowerCase()}. Мягкий, дышащий и удобный для ежедневного ношения.`, price: 120000, stock: 25 },
  { titleTpl: (mat, color) => `Платок ${mat} ${color}`, descTpl: (mat, color) => `Классический ${color.toLowerCase()} платок из ${mat.toLowerCase()}. Идеально подходит для любого случая.`, price: 95000, stock: 30 },
];

const UZ = {
  'Джерси': 'Jersi', 'Хлопок': 'Paxta', 'Шифон': 'Shifon', 'Шелк': 'Ipak', 'Сатин': 'Satin', 'Премиум': 'Premium',
  'Черный': 'Qora', 'Белый': 'Oq', 'Бежевый': 'Bej', 'Коричневый': 'Jigarrang', 'Серый': 'Kulrang', 'Розовый': 'Pushti',
  'Оливковый': 'Zaytunrang', 'Бордовый': 'Bordo', 'Кремовый': 'Kremrang', 'Синий': "Ko'k", 'Голубой': 'Havorang',
  'Зеленый': 'Yashil', 'Темно-синий': "To'q ko'k", 'Лавандовый': 'Lavanda', 'Золотой': 'Oltinrang',
  'Серебряный': 'Kumushrang', 'Изумрудный': 'Zumrad', 'Шоколадный': 'Shokoladrang', 'Темно-зеленый': "To'q yashil",
};

const EN = {
  'Джерси': 'Jersey', 'Хлопок': 'Cotton', 'Шифон': 'Chiffon', 'Шелк': 'Silk', 'Сатин': 'Satin', 'Премиум': 'Premium',
  'Черный': 'Black', 'Белый': 'White', 'Бежевый': 'Beige', 'Коричневый': 'Brown', 'Серый': 'Gray', 'Розовый': 'Pink',
  'Оливковый': 'Olive', 'Бордовый': 'Burgundy', 'Кремовый': 'Cream', 'Синий': 'Blue', 'Голубой': 'Light blue',
  'Зеленый': 'Green', 'Темно-синий': 'Navy', 'Лавандовый': 'Lavender', 'Золотой': 'Gold',
  'Серебряный': 'Silver', 'Изумрудный': 'Emerald', 'Шоколадный': 'Chocolate', 'Темно-зеленый': 'Dark green',
};

function productText(matRu, colorRu) {
  const matUz = UZ[matRu];
  const colorUz = UZ[colorRu];
  const matEn = EN[matRu];
  const colorEn = EN[colorRu];
  return {
    titleRu: `${colorRu} хиджаб из ${matRu}`,
    titleUz: `${colorUz} ${matUz} hijob`,
    titleEn: `${colorEn} ${matEn} hijab`,
    descriptionRu: `Элегантный ${colorRu.toLowerCase()} хиджаб из материала ${matRu.toLowerCase()}. Мягкий и удобный для ежедневного ношения.`,
    descriptionUz: `${colorUz} rangli ${matUz.toLowerCase()} hijob. Yumshoq, qulay va kundalik taqish uchun mos.`,
    descriptionEn: `Elegant ${colorEn.toLowerCase()} ${matEn.toLowerCase()} hijab. Soft, comfortable, and suitable for daily wear.`,
  };
}

async function main() {
  console.log('🌱 Запуск сидирования...');

  const existingCats = await prisma.category.count();
  if (existingCats > 0) {
    console.log('⚠️  БД уже заполнена. Пропускаем.');
    return;
  }

  for (const cat of CATEGORIES) {
    const parent = await prisma.category.create({
      data: { name: cat.name, nameRu: cat.name, nameUz: UZ[cat.name], nameEn: EN[cat.name] },
    });
    console.log(`  📂 ${cat.name}`);

    for (const subName of cat.subs) {
      const sub = await prisma.category.create({
        data: { name: subName, nameRu: subName, nameUz: UZ[subName], nameEn: EN[subName], parentId: parent.id },
      });
      console.log(`    └─ ${subName}`);

      // Add 1-2 demo products per subcategory
      const demo = DEMO_PRODUCTS[Math.floor(Math.random() * DEMO_PRODUCTS.length)];
      const localized = productText(cat.name, subName);
      await prisma.product.create({
        data: {
          title: localized.titleRu,
          titleUz: localized.titleUz,
          titleRu: localized.titleRu,
          titleEn: localized.titleEn,
          description: localized.descriptionRu,
          descriptionUz: localized.descriptionUz,
          descriptionRu: localized.descriptionRu,
          descriptionEn: localized.descriptionEn,
          price: demo.price + Math.floor(Math.random() * 80000),
          stock: 10 + Math.floor(Math.random() * 40),
          photos: '[]',
          categoryId: sub.id,
        },
      });
    }
  }

  console.log('✅ Сидирование завершено!');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
