const ru = require('../locales/ru');
const uz = require('../locales/uz');
const en = require('../locales/en');

const locales = { ru, uz, en };

function getT(lang) {
  return locales[lang] || locales['ru'];
}

async function i18nMiddleware(ctx, next) {
  const lang = ctx.state.user?.language || 'ru';
  ctx.t = getT(lang);
  return next();
}

module.exports = { getT, i18nMiddleware };
