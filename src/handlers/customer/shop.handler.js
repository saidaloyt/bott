const { Markup } = require('telegraf');
const categoryService = require('../../services/category.service');
const productService = require('../../services/product.service');
const cartService = require('../../services/cart.service');
const { mainMenuKeyboard, cancelKeyboard, productKeyboard } = require('../../keyboards/customer');
const { getLang, localizeProduct, localizeProducts, categoryName } = require('../../utils/localized');

async function getCategoryAndDescendantIds(categoryId) {
  const ids = [categoryId];
  const children = await categoryService.getChildren(categoryId);
  for (const child of children) {
    ids.push(...await getCategoryAndDescendantIds(child.id));
  }
  return ids;
}

async function getAllProductsForCategoryTree(categoryId, lang) {
  const ids = await getCategoryAndDescendantIds(categoryId);
  const products = [];

  for (const id of ids) {
    let page = 1;
    let result;
    do {
      result = await productService.getByCategory(id, page);
      products.push(...result.products);
      page += 1;
    } while (result.meta.hasNext);
  }

  return localizeProducts(products, lang)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function productCardKeyboard(productId, backData, t) {
  return Markup.inlineKeyboard([
    [Markup.button.callback(t.addToCart, `cart_add_${productId}`)],
    [Markup.button.callback(t.viewProduct, `product_${productId}`)],
    [Markup.button.callback(t.back, backData)],
  ]);
}

async function showCategories(ctx) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const categories = await categoryService.getRoots();

  if (!categories.length) {
    return ctx.reply(t.noCategories, mainMenuKeyboard(t));
  }

  const buttons = categories.map((cat) => [
    Markup.button.callback(`📂 ${categoryName(cat, lang)}`, `cat_${cat.id}`),
  ]);
  buttons.push([Markup.button.callback(t.search, 'search_products')]);

  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      await ctx.editMessageText(t.shopTitle, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    } else {
      await ctx.reply(t.shopTitle, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    }
  } catch (_) {
    await ctx.reply(t.shopTitle, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  }
}

async function handleCategory(ctx) {
  const categoryId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  const lang = getLang(ctx);

  const category = await categoryService.getById(categoryId);
  if (!category) return ctx.reply('❌');

  const children = await categoryService.getChildren(categoryId);
  const backData = category.parentId ? `cat_${category.parentId}` : 'shop_categories';
  const breadcrumbs = await categoryService.getBreadcrumbs(categoryId);
  const path = breadcrumbs.map((c) => categoryName(c, lang)).join(' › ');

  if (!category.parentId && children.length > 0) {
    const buttons = children.map((child) => [
      Markup.button.callback(` ${categoryName(child, lang)}`, `cat_${child.id}`),
    ]);
    buttons.push([Markup.button.callback(t.back, backData)]);
    try {
      await ctx.editMessageText(t.chooseSubcat(path), { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    } catch (_) {
      await ctx.reply(t.chooseSubcat(path), { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    }
    return;
  }

  await showProductsInCategory(ctx, categoryId, path, backData);
}

async function showProductsInCategory(ctx, categoryId, path, backData) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const products = await getAllProductsForCategoryTree(categoryId, lang);

  if (!products.length) {
    const kb = Markup.inlineKeyboard([[Markup.button.callback(t.back, backData || 'shop_categories')]]);
    try { await ctx.editMessageText(t.noProducts, { parse_mode: 'HTML', ...kb }); }
    catch (_) { await ctx.reply(t.noProducts, { parse_mode: 'HTML', ...kb }); }
    return;
  }

  const text = t.productsInCategory ? t.productsInCategory(path, products.length) : t.productsIn(path, products.length, 1, 1);
  const backKeyboard = Markup.inlineKeyboard([[Markup.button.callback(t.back, backData || 'shop_categories')]]);
  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...backKeyboard });
  } catch (_) {
    await ctx.reply(text, { parse_mode: 'HTML', ...backKeyboard });
  }

  for (const product of products) {
    ctx.session.productBackData ||= {};
    ctx.session.productBackData[product.id] = backData || 'shop_categories';
    const cardText = t.productCard ? t.productCard(product) : t.productInfo(product, 1);
    const keyboard = productCardKeyboard(product.id, backData || 'shop_categories', t);
    if (product.photos?.length > 0) {
      try {
        await ctx.replyWithPhoto(product.photos[0], { caption: cardText, parse_mode: 'HTML', ...keyboard });
        continue;
      } catch (_) {}
    }
    await ctx.reply(cardText, { parse_mode: 'HTML', ...keyboard });
  }
}

async function handleCategoryProductsPage(ctx) {
  const categoryId = parseInt(ctx.match[1]);
  const page = parseInt(ctx.match[2]);
  await ctx.answerCbQuery();

  const category = await categoryService.getById(categoryId);
  const breadcrumbs = await categoryService.getBreadcrumbs(categoryId);
  const lang = getLang(ctx);
  const path = breadcrumbs.map((c) => categoryName(c, lang)).join(' › ');
  const backData = category?.parentId ? `cat_${category.parentId}` : 'shop_categories';

  await showProductsInCategory(ctx, categoryId, path, backData);
}

async function showProduct(ctx) {
  const productId = parseInt(ctx.match[1]);
  if (ctx.callbackQuery) await ctx.answerCbQuery();
  const t = ctx.t;
  const lang = getLang(ctx);

  const product = localizeProduct(await productService.getById(productId), lang);
  if (!product) return ctx.reply(t.outOfStock);

  if (!ctx.session.productQty) ctx.session.productQty = {};
  if (!ctx.session.productQty[productId]) ctx.session.productQty[productId] = 1;
  const qty = ctx.session.productQty[productId];

  const text = t.productInfo(product, qty);
  const keyboard = productKeyboard(productId, qty, product.categoryId, t, ctx.session.productBackData?.[productId]);

  if (product.photos?.length > 0) {
    try {
      await ctx.replyWithPhoto(product.photos[0], { caption: text, parse_mode: 'HTML', ...keyboard });
      return;
    } catch (_) {}
  }
  await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
}

async function handleQtyMinus(ctx) {
  const productId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  if (!ctx.session.productQty) ctx.session.productQty = {};
  ctx.session.productQty[productId] = Math.max(1, (ctx.session.productQty[productId] || 1) - 1);
  await updateProductMessage(ctx, productId);
}

async function handleQtyPlus(ctx) {
  const productId = parseInt(ctx.match[1]);
  const product = await productService.getById(productId);
  await ctx.answerCbQuery();
  if (!ctx.session.productQty) ctx.session.productQty = {};
  const cur = ctx.session.productQty[productId] || 1;
  ctx.session.productQty[productId] = Math.min(cur + 1, product.stock);
  await updateProductMessage(ctx, productId);
}

async function updateProductMessage(ctx, productId) {
  const t = ctx.t;
  const product = localizeProduct(await productService.getById(productId), getLang(ctx));
  const qty = ctx.session.productQty?.[productId] || 1;
  const text = t.productInfo(product, qty);
  const keyboard = productKeyboard(productId, qty, product.categoryId, t, ctx.session.productBackData?.[productId]);
  try {
    await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
  } catch (_) {
    try { await ctx.editMessageCaption(text, { parse_mode: 'HTML', ...keyboard }); } catch (__) {}
  }
}

async function handleAddToCart(ctx) {
  const productId = parseInt(ctx.match[1]);
  const t = ctx.t;
  const user = ctx.state.user;
  const qty = ctx.session.productQty?.[productId] || 1;

  try {
    await cartService.addItem(user.id, productId, qty);
    const product = localizeProduct(await productService.getById(productId), getLang(ctx));
    if (ctx.session.productQty) delete ctx.session.productQty[productId];
    await ctx.answerCbQuery(t.cartAdded(product.title).replace(/<[^>]+>/g, ''), { show_alert: true });
  } catch (error) {
    const errorText = error.message === 'out_of_stock'
      ? t.outOfStock
      : error.message === 'product_not_found'
        ? t.productNotFound
        : t.errorGeneric(error.message);
    await ctx.answerCbQuery(errorText.replace(/<[^>]+>/g, ''), { show_alert: true });
  }
}

async function searchProducts(ctx) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();
  ctx.session.awaitingSearch = true;
  await ctx.reply(ctx.t.searchPrompt, cancelKeyboard(ctx.t));
}

async function handleSearchQuery(ctx) {
  if (!ctx.session.awaitingSearch) return false;
  delete ctx.session.awaitingSearch;
  const t = ctx.t;
  const query = ctx.message?.text?.trim();
  if (!query) return false;

  const result = await productService.search(query);
  const products = localizeProducts(result.products, getLang(ctx));
  const meta = result.meta;

  if (!products.length) {
    await ctx.reply(t.searchEmpty(query), { parse_mode: 'HTML', ...mainMenuKeyboard(t) });
    return true;
  }

  const buttons = products.map((p) => [
    Markup.button.callback(`🧣 ${p.title} — ${p.price.toLocaleString()} сум`, `product_${p.id}`),
  ]);

  await ctx.reply(t.searchResults(query, meta.total), { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  return true;
}

module.exports = {
  showCategories, handleCategory, handleCategoryProductsPage,
  showProduct, handleQtyMinus, handleQtyPlus, handleAddToCart,
  searchProducts, handleSearchQuery,
};
