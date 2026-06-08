function getLang(ctxOrLang) {
  const lang = typeof ctxOrLang === 'string'
    ? ctxOrLang
    : ctxOrLang?.state?.user?.language || ctxOrLang?.language;
  return ['uz', 'ru', 'en'].includes(lang) ? lang : 'ru';
}

function langSuffix(lang) {
  return { uz: 'Uz', ru: 'Ru', en: 'En' }[getLang(lang)];
}

function localizedField(entity, base, lang) {
  if (!entity) return '';
  const value = entity[`${base}${langSuffix(lang)}`];
  return value || entity[base] || '';
}

function productTitle(product, lang) {
  return localizedField(product, 'title', lang);
}

function productDescription(product, lang) {
  return localizedField(product, 'description', lang);
}

function categoryName(category, lang) {
  return localizedField(category, 'name', lang);
}

function localizeProduct(product, lang) {
  if (!product) return product;
  return {
    ...product,
    title: productTitle(product, lang),
    description: productDescription(product, lang),
    category: product.category ? localizeCategory(product.category, lang) : product.category,
  };
}

function localizeCategory(category, lang) {
  if (!category) return category;
  return {
    ...category,
    name: categoryName(category, lang),
    parent: category.parent ? localizeCategory(category.parent, lang) : category.parent,
    children: Array.isArray(category.children)
      ? category.children.map((child) => localizeCategory(child, lang))
      : category.children,
  };
}

function localizeProducts(products, lang) {
  return products.map((product) => localizeProduct(product, lang));
}

function localizeCategories(categories, lang) {
  return categories.map((category) => localizeCategory(category, lang));
}

module.exports = {
  getLang,
  productTitle,
  productDescription,
  categoryName,
  localizeProduct,
  localizeCategory,
  localizeProducts,
  localizeCategories,
};
