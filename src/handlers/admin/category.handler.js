const { Markup } = require('telegraf');
const categoryService = require('../../services/category.service');
const { adminMenuKeyboard, adminCancelKeyboard, categoryActionsKeyboard, confirmDeleteKeyboard } = require('../../keyboards/admin');
const { getLang, categoryName } = require('../../utils/localized');

function renderTree(nodes, lang, indent = 0) {
  let text = '';
  for (const node of nodes) {
    const prefix = '  '.repeat(indent) + (indent > 0 ? '└─ ' : '📂 ');
    text += `${prefix}${categoryName(node, lang)}\n`;
    if (node.children?.length) text += renderTree(node.children, lang, indent + 1);
  }
  return text;
}

async function showCategories(ctx) {
  const t = ctx.t;
  const lang = getLang(ctx);
  const tree = await categoryService.getTree();
  const roots = await categoryService.getRoots();
  const treeText = tree.length ? renderTree(tree, lang) : t.catsEmpty;

  const buttons = roots.map((cat) => [
    Markup.button.callback(`📂 ${categoryName(cat, lang)}`, `admin_cat_view_${cat.id}`),
  ]);
  buttons.push([Markup.button.callback(t.addCategory, 'admin_cat_add_root')]);

  const text = `${t.catsTitle}\n\n<pre>${treeText}</pre>`;
  try {
    if (ctx.callbackQuery) {
      await ctx.answerCbQuery();
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    } else {
      await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    }
  } catch (_) {
    await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  }
}

async function viewCategory(ctx) {
  const categoryId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  const lang = getLang(ctx);
  const category = await categoryService.getById(categoryId);
  if (!category) return ctx.reply(t.categoryNotFound, adminMenuKeyboard(t));

  const { hasChildren, hasProducts } = await categoryService.hasContent(categoryId);
  const breadcrumbs = await categoryService.getBreadcrumbs(categoryId);
  const path = breadcrumbs.map((c) => categoryName(c, lang)).join(' › ');

  const text =
    `📂 <b>${path}</b>\n\n` +
    `🆔 ID: ${category.id}\n` +
    `👶 ${t.catSubcategories}: ${category.children?.length || 0}\n` +
    `🧣 ${hasProducts ? t.catHasProductsLabel : t.catNoProductsLabel}`;

  try {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...categoryActionsKeyboard(categoryId, category.parentId, t),
    });
  } catch (_) {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...categoryActionsKeyboard(categoryId, category.parentId, t),
    });
  }
}

async function startAddRootCategory(ctx) {
  await ctx.answerCbQuery();
  ctx.session.adminAction = { type: 'add_category', parentId: null };
  await ctx.reply(ctx.t.catNameUzPrompt, adminCancelKeyboard);
}

async function startAddSubCategory(ctx) {
  const parentId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  ctx.session.adminAction = { type: 'add_category', parentId };
  const parent = await categoryService.getById(parentId);
  await ctx.reply(ctx.t.catSubNamePrompt(categoryName(parent, getLang(ctx)) || ''), { parse_mode: 'HTML', ...adminCancelKeyboard });
  await ctx.reply(ctx.t.catNameUzPrompt, adminCancelKeyboard);
}

async function startRenameCategory(ctx) {
  const categoryId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const category = await categoryService.getById(categoryId);
  ctx.session.adminAction = { type: 'rename_category', categoryId };
  await ctx.reply(ctx.t.catRenamePrompt(categoryName(category, getLang(ctx)) || ''), { parse_mode: 'HTML', ...adminCancelKeyboard });
  await ctx.reply(ctx.t.catNameUzPrompt, adminCancelKeyboard);
}

async function confirmDeleteCategory(ctx) {
  const categoryId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  const category = await categoryService.getById(categoryId);
  const { hasChildren, hasProducts } = await categoryService.hasContent(categoryId);

  let warning = '';
  if (hasChildren) warning += t.catHasChildren;
  if (hasProducts) warning += t.catHasProducts;

  const text = t.catDeleteConfirm(categoryName(category, getLang(ctx)) || '', warning);
  try {
    await ctx.editMessageText(text, {
      parse_mode: 'HTML',
      ...confirmDeleteKeyboard('category', categoryId, `admin_cat_view_${categoryId}`, t),
    });
  } catch (_) {
    await ctx.reply(text, {
      parse_mode: 'HTML',
      ...confirmDeleteKeyboard('category', categoryId, `admin_cat_view_${categoryId}`, t),
    });
  }
}

async function executeDeleteCategory(ctx) {
  const categoryId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery();
  const t = ctx.t;
  try {
    await categoryService.delete(categoryId);
    try { await ctx.editMessageText(t.categoryDeleted); } catch (_) {}
    await showCategories(ctx);
  } catch (error) {
    await ctx.reply(t.errorGeneric(error.message), adminMenuKeyboard(t));
  }
}

async function handleCategoryInput(ctx) {
  const action = ctx.session.adminAction;
  if (!action || !['add_category', 'rename_category'].includes(action.type)) return false;

  const t = ctx.t;
  const text = ctx.message?.text?.trim();
  if (!text || text.length < 2) {
    await ctx.reply(t.catNameTooShort, adminCancelKeyboard);
    return true;
  }

  if (!action.step) action.step = 'nameUz';
  action.data ||= {};
  action.data[action.step] = text;

  if (action.step === 'nameUz') {
    action.step = 'nameRu';
    await ctx.reply(t.catNameRuPrompt, adminCancelKeyboard);
    return true;
  }
  if (action.step === 'nameRu') {
    action.step = 'nameEn';
    await ctx.reply(t.catNameEnPrompt, adminCancelKeyboard);
    return true;
  }

  try {
    if (action.type === 'add_category') {
      const cat = await categoryService.create(action.data, action.parentId);
      delete ctx.session.adminAction;
      await ctx.reply(t.categoryCreated(categoryName(cat, getLang(ctx))), { parse_mode: 'HTML', ...adminMenuKeyboard(t) });
    } else {
      const cat = await categoryService.rename(action.categoryId, action.data);
      delete ctx.session.adminAction;
      await ctx.reply(t.categoryRenamed(categoryName(cat, getLang(ctx))), { parse_mode: 'HTML', ...adminMenuKeyboard(t) });
    }
  } catch (error) {
    await ctx.reply(t.errorGeneric(error.message), adminMenuKeyboard(t));
  }
  return true;
}

module.exports = {
  showCategories, viewCategory,
  startAddRootCategory, startAddSubCategory, startRenameCategory,
  confirmDeleteCategory, executeDeleteCategory, handleCategoryInput,
};
