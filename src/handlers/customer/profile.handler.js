const { Markup } = require('telegraf');
const userService = require('../../services/user.service');
const orderService = require('../../services/order.service');
const { formatDate } = require('../../utils/format');
const { getT } = require('../../utils/i18n');
const {
  mainMenuKeyboard, profileKeyboard, cancelKeyboard,
  editProfileInlineKeyboard, sharePhoneKeyboard, langKeyboard, authChoiceKeyboard,
} = require('../../keyboards/customer');
const {
  isValidFullName, isValidPhone, isValidEmail, normalizePhone,
} = require('../../utils/validation');

// ─── Language selection ───────────────────────────────────
async function handleLangSelect(ctx) {
  const lang = ctx.match[1]; // ru | uz | en
  await ctx.answerCbQuery();

  await userService.updateProfile(ctx.state.user.telegramId, { language: lang });
  ctx.state.user = await userService.findByTelegramId(ctx.state.user.telegramId);
  ctx.t = getT(lang);
  const t = ctx.t;

  await ctx.reply(t.langSet);

  // If already registered — go to main menu
  if (ctx.state.user.fullName && ctx.state.user.phone) {
    return ctx.reply(
      t.loginSuccess(ctx.state.user.fullName),
      { parse_mode: 'HTML', ...mainMenuKeyboard(t) },
    );
  }

  // Otherwise let the customer choose registration or login by access code.
  return ctx.reply(t.authPrompt, authChoiceKeyboard(t));
}

async function startRegistration(ctx) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();
  const t = ctx.t;
  ctx.session.registration = { step: 'name', data: {} };
  await ctx.reply(t.regStep1, { parse_mode: 'HTML', ...cancelKeyboard(t) });
}

// ─── Registration steps ───────────────────────────────────
async function handleRegistrationStep(ctx) {
  const reg = ctx.session.registration;
  if (!reg) return false;
  const t = ctx.t;

  // Phone via contact button (step 2)
  if (ctx.message?.contact && reg.step === 'phone') {
    const phone = normalizePhone(ctx.message.contact.phone_number);
    reg.data.phone = phone;
    reg.step = 'email';
    await ctx.reply(t.regStep3, { parse_mode: 'HTML', ...cancelKeyboard(t) });
    return true;
  }

  const text = ctx.message?.text?.trim();
  if (!text) return false;

  // Step 1: Full name — exactly 3 words
  if (reg.step === 'name') {
    if (!isValidFullName(text)) {
      await ctx.reply(t.invalidName, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    reg.data.fullName = text;
    reg.step = 'phone';
    await ctx.reply(t.regStep2, { parse_mode: 'HTML', ...sharePhoneKeyboard(t) });
    return true;
  }

  // Step 3: Gmail
  if (reg.step === 'email') {
    if (!isValidEmail(text)) {
      await ctx.reply(t.invalidEmail, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    reg.data.email = text;
    return finishRegistration(ctx);
  }

  return false;
}

async function finishRegistration(ctx) {
  const reg = ctx.session.registration;
  const t = ctx.t;
  const user = await userService.completeRegistration(ctx.state.user.telegramId, reg.data);
  ctx.state.user = user;
  delete ctx.session.registration;

  await ctx.reply(
    t.regDone(user.fullName, user.accessCode),
    { parse_mode: 'HTML', ...mainMenuKeyboard(t) },
  );
  return true;
}

// ─── Login by code ────────────────────────────────────────
async function startLogin(ctx) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();
  ctx.session.awaitingLoginCode = true;
  await ctx.reply(ctx.t.loginPrompt, { parse_mode: 'HTML', ...cancelKeyboard(ctx.t) });
}

async function handleLoginCode(ctx) {
  if (!ctx.session.awaitingLoginCode) return false;
  const code = ctx.message?.text?.trim();
  if (!code) return false;
  delete ctx.session.awaitingLoginCode;

  const t = ctx.t;
  const found = await userService.findByAccessCode(code);
  if (!found) {
    await ctx.reply(t.loginFail, langKeyboard);
    return true;
  }

  // Rebind telegramId on new device
  if (found.telegramId !== String(ctx.from.id)) {
    const { prisma } = require('../../config/database');
    await prisma.user.delete({ where: { telegramId: String(ctx.from.id) } }).catch(() => {});
    await userService.updateProfile(found.telegramId, { telegramId: String(ctx.from.id) });
  }

  ctx.state.user = await userService.findByTelegramId(String(ctx.from.id));
  ctx.t = getT(ctx.state.user.language);

  await ctx.reply(
    ctx.t.loginSuccess(found.fullName),
    { parse_mode: 'HTML', ...mainMenuKeyboard(ctx.t) },
  );
  return true;
}

// ─── Profile view ─────────────────────────────────────────
async function showProfile(ctx) {
  const user = ctx.state.user;
  const t = ctx.t;
  const { meta } = await orderService.getUserOrders(user.id, 1);
  const langLabel = { ru: '🇷🇺 Русский', uz: "🇺🇿 O'zbek", en: '🇬🇧 English' }[user.language] || '—';

  const text =
    `${t.profileTitle}\n\n` +
    `👤 <b>${t.profileName}:</b> ${user.fullName || '—'}\n` +
    `📱 <b>${t.profilePhone}:</b> ${user.phone || '—'}\n` +
    `📧 <b>${t.profileEmail}:</b> ${user.email || '—'}\n` +
    `🔑 <b>${t.profileCode}:</b> <code>${user.accessCode || '—'}</code>\n` +
    `📦 <b>${t.profileOrders}:</b> ${meta.total}\n` +
    `🌐 <b>${t.profileLang}:</b> ${langLabel}\n` +
    `📅 <b>${t.profileDate}:</b> ${formatDate(user.createdAt)}`;

  await ctx.reply(text, { parse_mode: 'HTML', ...profileKeyboard(t) });
}

async function showEditProfile(ctx) {
  await ctx.reply('✏️', editProfileInlineKeyboard(ctx.t));
}

async function handleEditProfileCallback(ctx) {
  const action = ctx.match[1];
  await ctx.answerCbQuery();
  const t = ctx.t;

  if (action === 'phone') {
    ctx.session.editProfile = { field: 'phone' };
    return ctx.reply(t.regStep2, { parse_mode: 'HTML', ...sharePhoneKeyboard(t) });
  }

  ctx.session.editProfile = { field: action };
  const prompts = {
    name: `👤 ${t.profileName}:`,
    email: `📧 ${t.profileEmail}:`,
  };
  await ctx.reply(prompts[action] || ':', cancelKeyboard(t));
}

async function handleContactEdit(ctx) {
  const s = ctx.session.editProfile;
  if (!s || s.field !== 'phone') return false;
  const phone = normalizePhone(ctx.message.contact.phone_number);
  await userService.updateProfile(ctx.state.user.telegramId, { phone });
  ctx.state.user = await userService.findByTelegramId(ctx.state.user.telegramId);
  delete ctx.session.editProfile;
  await ctx.reply(ctx.t.profileUpdated, profileKeyboard(ctx.t));
  return true;
}

async function handleProfileEdit(ctx) {
  if (!ctx.session.editProfile) return false;
  const { field } = ctx.session.editProfile;
  if (field === 'phone') return false;
  const value = ctx.message?.text?.trim();
  const t = ctx.t;

  if (field === 'name') {
    if (!isValidFullName(value)) {
      await ctx.reply(t.invalidName, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    await userService.updateProfile(ctx.state.user.telegramId, { fullName: value });
  } else if (field === 'email') {
    if (!isValidEmail(value)) {
      await ctx.reply(t.invalidEmail, { parse_mode: 'HTML', ...cancelKeyboard(t) });
      return true;
    }
    await userService.updateProfile(ctx.state.user.telegramId, { email: value });
  } else {
    return false;
  }

  ctx.state.user = await userService.findByTelegramId(ctx.state.user.telegramId);
  delete ctx.session.editProfile;
  await ctx.reply(t.profileUpdated, profileKeyboard(t));
  return true;
}

async function profileDone(ctx) {
  await ctx.answerCbQuery();
  delete ctx.session.editProfile;
  await showProfile(ctx);
}

// ─── Change language from profile ─────────────────────────
async function showLangSelect(ctx) {
  await ctx.reply(ctx.t.chooseLanguage, langKeyboard);
}

module.exports = {
  handleLangSelect,
  handleRegistrationStep,
  startRegistration,
  startLogin,
  handleLoginCode,
  showProfile,
  showEditProfile,
  handleEditProfileCallback,
  handleContactEdit,
  handleProfileEdit,
  profileDone,
  showLangSelect,
};
