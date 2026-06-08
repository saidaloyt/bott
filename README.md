# 🧣 Hijab Market Bot v2.0

Полноценный Telegram e-commerce бот для продажи хиджабов и платков.

## 🛠 Технологии

- **Node.js** + **Telegraf** — бот
- **SQLite** + **Prisma ORM** — база данных (без сервера)
- **dotenv** — переменные окружения

## 🚀 Быстрый старт

```bash
# 1. Установить зависимости
npm install

# 2. Настроить окружение
cp .env.example .env
# Заполните BOT_TOKEN и ADMIN_ID

# 3. Одна команда для всего
npm run setup
```

**Или по шагам:**
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

## 📁 Структура

```
src/
├── bot/index.js          # Инициализация и все роуты
├── handlers/
│   ├── admin/            # stats, categories, products, orders, users, settings
│   └── customer/         # start, shop, cart, order, profile, info
├── keyboards/            # customer.js, admin.js
├── middlewares/          # auth, session, error
├── services/             # user, category, product, order, cart, notification, photo_preset
├── locales/              # ru.js, uz.js, en.js
├── utils/                # format, i18n, validation, pagination, logger, code
└── config/               # index.js, database.js
prisma/
├── schema.prisma
└── seed.js
```

## ✅ Функции

### Покупатель
| Функция | |
|---|---|
| 🌐 Выбор языка (RU / UZ / EN) | ✅ |
| 📝 Регистрация (ФИО + телефон кнопкой + Gmail) | ✅ |
| 🔑 Вход по 6-значному коду | ✅ |
| 🛍 Каталог с вложенными категориями | ✅ |
| 🔢 Выбор количества ➖/➕ на странице товара | ✅ |
| 🛒 Корзина (добавить, изменить, удалить) | ✅ |
| ✅ Оформление заказа с картой | ✅ |
| 📦 История заказов + отмена | ✅ |
| 👤 Профиль + редактирование | ✅ |
| 🔍 Поиск товаров | ✅ |

### Администратор
| Функция | |
|---|---|
| 📊 Статистика (выручка, заказы, пользователи) | ✅ |
| 📂 CRUD категорий с деревом | ✅ |
| 🧣 CRUD товаров (категория → подкатегория → детали) | ✅ |
| 📸 Фото товаров + пресеты | ✅ |
| 📦 Заказы + фильтры + смена статуса | ✅ |
| 👥 Пользователи + поиск | ✅ |
| 👮 Модераторы (заявки, одобрение) | ✅ |
| ⚙️ Настройки (фото-пресеты, модераторы) | ✅ |

## 🌐 Языки
- 🇷🇺 Русский
- 🇺🇿 O'zbek
- 🇬🇧 English

## ⚙️ .env

```env
BOT_TOKEN=токен_от_BotFather
ADMIN_ID=ваш_telegram_id
SHOP_NAME=Hijab Market
DATABASE_URL=file:./dev.db
NODE_ENV=development
```

## 📦 Команды

```bash
npm run dev          # Разработка
npm start            # Продакшен
npm run db:push      # Применить схему
npm run db:seed      # Тестовые данные
npm run db:studio    # Просмотр БД
npm run db:reset     # Сбросить БД
```
