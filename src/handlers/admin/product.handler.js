const { Markup } = require('telegraf');

const productService = require('../../services/product.service');
const categoryService = require('../../services/category.service');
const photoPresetService = require('../../services/photo_preset.service');

const {
  adminMenuKeyboard,
  adminCancelKeyboard,
  productActionsKeyboard,
  confirmDeleteKeyboard,
} = require('../../keyboards/admin');

const { buildPaginationButtons } = require('../../utils/pagination');
const { isPositiveInteger } = require('../../utils/validation');
const {
  getLang,
  localizeProduct,
  localizeProducts,
  categoryName,
  productTitle,
} = require('../../utils/localized');

// ───────────────────────────────────────────────────────────
// PRODUCTS LIST
// ───────────────────────────────────────────────────────────

async function showProducts(ctx) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const page = parseInt(ctx.match?.[1]) || 1;

  const result = await productService.getAll(page);

  const products = localizeProducts(result.products, lang);
  const meta = result.meta;

  if (!products.length) {
    return ctx.reply(
      t.prodsEmpty,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(t.addProduct, 'admin_prod_add')],
        ]),
      }
    );
  }

  const buttons = products.map((p) => [
    Markup.button.callback(
      `🧣 ${p.title} — ${p.price.toLocaleString()} (${p.stock})`,
      `admin_prod_view_${p.id}`
    ),
  ]);

  const paginationBtns = buildPaginationButtons(meta, 'admin_products');

  if (paginationBtns.length) {
    buttons.push(paginationBtns);
  }

  buttons.push([
    Markup.button.callback(t.addProduct, 'admin_prod_add'),
  ]);

  const text = t.prodsTitle(meta.total, meta.page, meta.totalPages);

  try {
    if (ctx.callbackQuery) {
      await ctx.editMessageText(text, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(buttons),
      });
    } else {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard(buttons),
      });
    }
  } catch (_) {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard(buttons),
    });
  }
}

// ───────────────────────────────────────────────────────────
// VIEW PRODUCT
// ───────────────────────────────────────────────────────────

async function viewProduct(ctx) {
  const productId = parseInt(ctx.match[1]);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const t = ctx.t;

  const product = localizeProduct(
    await productService.getById(productId),
    getLang(ctx)
  );

  if (!product) {
    return ctx.reply(t.productNotFound);
  }

  const text =
    `🧣 <b>${product.title}</b>\n\n` +
    `📄 ${product.description || '—'}\n\n` +
    `💰 ${product.price.toLocaleString()}\n` +
    `📦 ${t.stockBtn}: ${product.stock}\n` +
    `📂 ${product.category?.name || '—'}\n` +
    `🖼 ${product.photos?.length || 0}`;

  await ctx.reply(text, {
    parse_mode: 'HTML',
    ...productActionsKeyboard(productId, false, t),
  });
}

// ───────────────────────────────────────────────────────────
// START ADD PRODUCT
// ───────────────────────────────────────────────────────────

async function startAddProduct(ctx) {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const t = ctx.t;
  const lang = getLang(ctx);

  const roots = await categoryService.getRoots();

  if (!roots.length) {
    return ctx.reply(t.prodCategoryFirst);
  }

  ctx.session.adminAction = {
    type: 'add_product',
    step: 'pick_root_cat',
    data: {},
  };

  const buttons = roots.map((cat) => [
    Markup.button.callback(
      `📂 ${categoryName(cat, lang)}`,
      `admin_prod_new_cat_${cat.id}`
    ),
  ]);

  buttons.push([
    Markup.button.callback(t.back, 'admin_products'),
  ]);

  await ctx.reply(t.prodStep1, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(buttons),
  });
}

async function askForProductTitle(ctx, categoryId) {
  ctx.session.adminAction = {
    type: 'add_product',
    step: 'title',
    data: { categoryId },
  };

  await ctx.reply(ctx.t.prodStep3, {
    parse_mode: 'HTML',
    ...adminCancelKeyboard,
  });
}

async function pickRootCategory(ctx) {
  const categoryId = parseInt(ctx.match[1], 10);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const t = ctx.t;
  const lang = getLang(ctx);
  const action = ctx.session.adminAction;

  if (!action || action.type !== 'add_product') {
    return ctx.reply(t.prodStep1, { parse_mode: 'HTML' });
  }

  const category = await categoryService.getById(categoryId);
  if (!category) {
    return ctx.reply(t.categoryNotFound || 'Category not found');
  }

  const children = await categoryService.getChildren(categoryId);

  if (!children.length) {
    return askForProductTitle(ctx, categoryId);
  }

  action.step = 'pick_sub_cat';
  action.data = { rootCategoryId: categoryId };

  const buttons = children.map((cat) => [
    Markup.button.callback(
      `рџ“‚ ${categoryName(cat, lang)}`,
      `admin_prod_new_subcat_${cat.id}`
    ),
  ]);

  buttons.push([
    Markup.button.callback(t.back, 'admin_prod_add'),
  ]);

  await ctx.reply(t.prodStep2(categoryName(category, lang)), {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard(buttons),
  });
}

async function pickSubCategory(ctx) {
  const categoryId = parseInt(ctx.match[1], 10);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const action = ctx.session.adminAction;

  if (!action || action.type !== 'add_product') {
    return ctx.reply(ctx.t.prodStep1, { parse_mode: 'HTML' });
  }

  const category = await categoryService.getById(categoryId);
  if (!category) {
    return ctx.reply(ctx.t.categoryNotFound || 'Category not found');
  }

  return askForProductTitle(ctx, categoryId);
}

async function handleAddProductStep(ctx) {
  const action = ctx.session.adminAction;
  if (!action || action.type !== 'add_product') return false;

  const text = ctx.message?.text?.trim();
  const t = ctx.t;

  if (!text) return true;

  action.data ||= {};

  if (action.step === 'title') {
    if (text.length < 2) {
      await ctx.reply(t.prodNameTooShort, adminCancelKeyboard);
      return true;
    }

    action.data.title = text;
    action.step = 'description';
    await ctx.reply(t.prodStep4, {
      parse_mode: 'HTML',
      ...adminCancelKeyboard,
    });
    return true;
  }

  if (action.step === 'description') {
    action.data.description = text === '-' ? null : text;
    action.step = 'price';
    await ctx.reply(t.prodStep5, {
      parse_mode: 'HTML',
      ...adminCancelKeyboard,
    });
    return true;
  }

  if (action.step === 'price') {
    if (!isPositiveInteger(text)) {
      await ctx.reply(t.prodInvalidPrice, adminCancelKeyboard);
      return true;
    }

    action.data.price = parseInt(text, 10);
    action.step = 'stock';
    await ctx.reply(t.prodStep6, {
      parse_mode: 'HTML',
      ...adminCancelKeyboard,
    });
    return true;
  }

  if (action.step === 'stock') {
    const stock = parseInt(text, 10);
    if (isNaN(stock) || stock < 0) {
      await ctx.reply(t.prodInvalidStock, adminCancelKeyboard);
      return true;
    }

    action.data.stock = stock;

    try {
      const product = await productService.create({
        ...action.data,
        titleUz: action.data.title,
        titleRu: action.data.title,
        titleEn: action.data.title,
        descriptionUz: action.data.description,
        descriptionRu: action.data.description,
        descriptionEn: action.data.description,
        photos: [],
      });

      delete ctx.session.adminAction;
      await ctx.reply(t.prodCreated(productTitle(product, getLang(ctx))), {
        parse_mode: 'HTML',
        ...productActionsKeyboard(product.id, false, t),
      });
    } catch (error) {
      await ctx.reply(t.errorGeneric(error.message), adminMenuKeyboard(t));
    }

    return true;
  }

  return false;
}

// ───────────────────────────────────────────────────────────
// HANDLE PHOTO UPLOAD
// ───────────────────────────────────────────────────────────

async function handleProductPhoto(ctx) {
  const action = ctx.session.adminAction;

  if (!action || action.type !== 'add_product_photo') {
    return false;
  }

  const photo = ctx.message?.photo?.pop()?.file_id;

  if (!photo) {
    await ctx.reply(ctx.t.invalidPhoto || '❌ Invalid photo');
    return true;
  }

  try {
    const product = await productService.getById(action.productId);

    if (!product) {
      await ctx.reply(ctx.t.productNotFound);
      delete ctx.session.adminAction;
      return true;
    }

    const updatedPhotos = [
      ...(product.photos || []),
      photo,
    ].filter(Boolean);

    await productService.update(action.productId, {
      photos: updatedPhotos,
    });

    await ctx.reply(ctx.t.photoAdded || '✅ Photo added');

  } catch (error) {
    console.error(error);
    await ctx.reply(ctx.t.errorOccurred || '❌ Error occurred');
  }

  return true;
}

// ───────────────────────────────────────────────────────────
// PHOTO MENU
// ───────────────────────────────────────────────────────────

async function showPhotoMenu(ctx) {
  const productId = parseInt(ctx.match[1]);

  await ctx.answerCbQuery();

  const t = ctx.t;

  await ctx.reply(
    t.photoManagement,
    Markup.inlineKeyboard([
      [Markup.button.callback(t.addPhoto, `admin_prod_add_photo_${productId}`)],
      [Markup.button.callback(t.seePhotos || '👁 See Photos', `admin_prod_see_photos_${productId}`)],
      [Markup.button.callback(t.deletePhoto, `admin_prod_delete_photo_menu_${productId}`)],
      [Markup.button.callback(t.back, `admin_prod_edit_${productId}`)],
    ])
  );
}

// ───────────────────────────────────────────────────────────
// ADD PHOTO MODE
// ───────────────────────────────────────────────────────────

async function startAddPhoto(ctx) {
  const productId = parseInt(ctx.match[1]);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  ctx.session.adminAction = {
    type: 'add_product_photo',
    productId,
  };

  await ctx.reply(
    ctx.t.prodPhotoPrompt || '📸 Send photos',
    Markup.keyboard([
      [ctx.t.done || '✅ Done'],
      [ctx.t.cancel || '❌ Cancel'],
    ]).resize()
  );
}

// ───────────────────────────────────────────────────────────
// SHOW PHOTOS
// ───────────────────────────────────────────────────────────

async function showPhotos(ctx) {
  const productId = parseInt(ctx.match[1]);

  await ctx.answerCbQuery();

  const product = await productService.getById(productId);

  if (!product) {
    return ctx.reply('❌ Product not found');
  }

  const photos = Array.isArray(product.photos)
    ? product.photos
    : JSON.parse(product.photos || '[]');

  if (!photos.length) {
    return ctx.reply('❌ No photos');
  }

  for (const photo of photos) {
    try {
      await ctx.replyWithPhoto(photo);
    } catch (error) {
      console.log('❌ Invalid photo:', photo);
    }
  }
}

// ───────────────────────────────────────────────────────────
// DELETE PHOTO MENU
// ───────────────────────────────────────────────────────────

async function showDeletePhotoMenu(ctx) {
  const productId = parseInt(ctx.match[1]);

  await ctx.answerCbQuery();

  const t = ctx.t;

  const product = await productService.getById(productId);

  if (!product) {
    return ctx.reply(t.productNotFound || '❌ Product not found');
  }

  const photos = Array.isArray(product.photos)
    ? product.photos
    : JSON.parse(product.photos || '[]');

  if (!photos.length) {
    return ctx.reply(t.noPhotos || '❌ No photos');
  }

  const buttons = photos.map((photo, index) => [
    Markup.button.callback(
      `❌ ${t.deletePhoto || 'Delete Photo'} ${index + 1}`,
      `admin_prod_delete_photo_${productId}_${index}`
    ),
  ]);

  buttons.push([
    Markup.button.callback(`⬅ ${t.back || 'Back'}`, `admin_prod_photos_${productId}`),
  ]);

  await ctx.reply(
    t.choosePhotoToDelete || '🗑 Choose photo to delete',
    Markup.inlineKeyboard(buttons)
  );
}

// ───────────────────────────────────────────────────────────
// DELETE PHOTO
// ───────────────────────────────────────────────────────────

async function deletePhoto(ctx) {
  const productId = parseInt(ctx.match[1]);
  const index = parseInt(ctx.match[2]);

  await ctx.answerCbQuery();

  const product = await productService.getById(productId);

  if (!product) {
    return ctx.reply('❌ Product not found');
  }

  const photos = Array.isArray(product.photos)
    ? product.photos
    : JSON.parse(product.photos || '[]');

  if (index < 0 || index >= photos.length) {
    return ctx.reply('❌ Invalid photo index');
  }

  const updatedPhotos = photos.filter((_, i) => i !== index);

  await productService.update(productId, { photos: updatedPhotos });

  await ctx.reply('✅ Photo deleted successfully');
}

// ───────────────────────────────────────────────────────────
// HANDLE INPUTS
// ───────────────────────────────────────────────────────────

async function handleProductInput(ctx) {
  const action = ctx.session.adminAction;
  if (!action) return false;

  const text = ctx.message?.text?.trim();
  const t = ctx.t;

  // ───────── PRICE EDIT ─────────
  if (action.type === 'edit_product_price') {
    const price = parseInt(text);

    if (isNaN(price) || price <= 0) {
      return ctx.reply(t.prodInvalidPrice || '❌ Invalid price');
    }

    await productService.update(action.productId, { price });
    delete ctx.session.adminAction;
    return ctx.reply(t.prodPriceUpdated(price));
  }

  // ───────── STOCK EDIT ─────────
  if (action.type === 'edit_product_stock') {
    const stock = parseInt(text);

    if (isNaN(stock) || stock < 0) {
      return ctx.reply(t.prodInvalidStock || '❌ Invalid stock');
    }

    await productService.update(action.productId, { stock });
    delete ctx.session.adminAction;
    return ctx.reply(t.prodStockUpdated(stock));
  }

  // ───────── PHOTO MODE ─────────
  if (action.type === 'add_product_photo') {
    const doneWords = [t.done, '✅ Done', 'Готово'];

    if (doneWords.includes(text)) {
      delete ctx.session.adminAction;
      return ctx.reply(t.prodPhotoFinished);
    }
  }

  return false;
}

// ───────────────────────────────────────────────────────────
// DELETE PRODUCT
// ───────────────────────────────────────────────────────────

async function confirmDeleteProduct(ctx) {
  const productId = parseInt(ctx.match[1]);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const t = ctx.t;

  const product = await productService.getById(productId);

  const text = t.prodDeleteConfirm(
    productTitle(product, getLang(ctx)) || ''
  );

  await ctx.reply(text, {
    parse_mode: 'HTML',
    ...confirmDeleteKeyboard(
      'product',
      productId,
      `admin_prod_view_${productId}`,
      t
    ),
  });
}

async function executeDeleteProduct(ctx) {
  const productId = parseInt(ctx.match[1]);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const t = ctx.t;

  try {
    await productService.delete(productId);
    await ctx.reply(t.prodDeleted, adminMenuKeyboard(t));
  } catch (error) {
    await ctx.reply(t.errorGeneric(error.message), adminMenuKeyboard(t));
  }
}

// ───────────────────────────────────────────────────────────
// EDIT PRODUCT MENU  ← FIXED
// ───────────────────────────────────────────────────────────

async function startEditProduct(ctx) {
  const productId = parseInt(ctx.match[1]);

  try {
    await ctx.answerCbQuery();
  } catch (_) {}

  const t = ctx.t;

  await ctx.reply(
    t.prodEdit || 'Choose what to edit',
    Markup.inlineKeyboard([
      [Markup.button.callback(t.editName || '✏️ Name', `admin_prod_edit_title_${productId}`)],
      [Markup.button.callback(t.editDesc || '📝 Description', `admin_prod_edit_desc_${productId}`)],
      [Markup.button.callback(t.priceBtn || '💰 Price', `admin_prod_price_${productId}`)],
      [Markup.button.callback(t.stockBtn || '📦 Stock', `admin_prod_stock_${productId}`)],
      [Markup.button.callback(t.editPhotos || '🖼 Photos', `admin_prod_photos_${productId}`)],
      [Markup.button.callback(t.back || '⬅ Back', `admin_prod_view_${productId}`)],
    ])
  );
}

module.exports = {
  showProducts,
  viewProduct,

  startAddProduct,

  handleProductPhoto,
  handleProductInput,

  showPhotoMenu,
  showPhotos,
  showDeletePhotoMenu,
  deletePhoto,

  startAddPhoto,

  confirmDeleteProduct,
  executeDeleteProduct,

  pickRootCategory,
  pickSubCategory,
  handleAddProductStep,
  startEditProduct,
  showPhotoPresets: async () => {},
  usePresetForProduct: async () => {},
};
