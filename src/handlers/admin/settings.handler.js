const { Markup } = require('telegraf');
const userService = require('../../services/user.service');
const photoPresetService = require('../../services/photo_preset.service');
const notificationService = require('../../services/notification.service');
const config = require('../../config');
const { adminMenuKeyboard, adminCancelKeyboard, settingsKeyboard } = require('../../keyboards/admin');
const { formatDate } = require('../../utils/format');

async function showSettings(ctx) {
  const t = ctx.t;
  try {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); await ctx.editMessageText(t.settingsTitle, { parse_mode: 'HTML', ...settingsKeyboard(t) }); }
    else await ctx.reply(t.settingsTitle, { parse_mode: 'HTML', ...settingsKeyboard(t) });
  } catch (_) { await ctx.reply(t.settingsTitle, { parse_mode: 'HTML', ...settingsKeyboard(t) }); }
}

async function showSubAdmins(ctx) {
  await ctx.answerCbQuery();
  const t = ctx.t;
  const subAdmins = await userService.getSubAdmins();

  let text = t.modsTitle(subAdmins.length) + '\n\n';
  text += subAdmins.length ? subAdmins.map((u, i) => `${i + 1}. ${u.fullName || '—'} | 📱 ${u.phone || '—'}`).join('\n') : t.modsEmpty;

  const buttons = subAdmins.map((u) => [
    Markup.button.callback(t.modRemove(u.fullName || `ID ${u.id}`), `admin_subadmin_revoke_${u.id}`),
  ]);
  buttons.push([Markup.button.callback(t.settingsRequests, 'admin_settings_requests')]);
  buttons.push([Markup.button.callback(t.back, 'admin_settings')]);

  try { await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
  catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
}

async function showAdminRequests(ctx) {
  if (ctx.callbackQuery) await ctx.answerCbQuery();
  const t = ctx.t;
  const requests = await userService.getPendingAdminRequests();
  const backBtn = [[Markup.button.callback(t.back, 'admin_settings_subadmins')]];

  if (!requests.length) {
    const text = t.reqEmpty;
    try {
      if (ctx.callbackQuery) await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(backBtn) });
      else await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(backBtn) });
    } catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(backBtn) }); }
    return;
  }

  let text = t.reqTitle(requests.length) + '\n\n';
  requests.forEach((u, i) => {
    text += `${i + 1}. ${u.fullName || '—'} | 📱 ${u.phone || '—'}\n   📅 ${formatDate(u.createdAt)}\n\n`;
  });

  const buttons = requests.flatMap((u) => [[
    Markup.button.callback(t.reqApprove(u.fullName || `ID ${u.id}`), `admin_subadmin_approve_${u.id}`),
    Markup.button.callback(t.reqReject, `admin_subadmin_deny_${u.id}`),
  ]]);
  buttons.push(...backBtn);

  try {
    if (ctx.callbackQuery) await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
    else await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) });
  } catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
}

async function approveSubAdmin(ctx) {
  const userId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery(ctx.t.reqApproved);
  const user = await userService.approveSubAdmin(userId);
  try {
    const { getT } = require('../../utils/i18n');
    const userT = getT(user.language || 'ru');
    await notificationService.bot.telegram.sendMessage(user.telegramId, userT.requestApproved);
  } catch (_) {}
  await showAdminRequests(ctx);
}

async function denySubAdmin(ctx) {
  const userId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery(ctx.t.reqRejected);
  await userService.revokeSubAdmin(userId);
  await showAdminRequests(ctx);
}

async function revokeSubAdmin(ctx) {
  const userId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery(ctx.t.reqRemoved);
  await userService.revokeSubAdmin(userId);
  await showSubAdmins(ctx);
}

async function showPhotoPresetsSettings(ctx) {
  await ctx.answerCbQuery();
  const t = ctx.t;
  const presets = await photoPresetService.getAll();

  let text = t.presetsTitle(presets.length) + '\n\n';
  text += presets.length ? presets.map((p, i) => `${i + 1}. ${p.name}`).join('\n') : t.presetsEmpty;

  const buttons = presets.map((p) => [
    Markup.button.callback(t.presetDelete(p.name), `admin_preset_delete_${p.id}`),
  ]);
  buttons.push([Markup.button.callback(t.presetAdd, 'admin_preset_add')]);
  buttons.push([Markup.button.callback(t.back, 'admin_settings')]);

  try { await ctx.editMessageText(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
  catch (_) { await ctx.reply(text, { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) }); }
}

async function startAddPreset(ctx) {
  await ctx.answerCbQuery();
  ctx.session.adminAction = { type: 'add_preset_photo' };
  await ctx.reply(ctx.t.presetPhotoPrompt, Markup.keyboard([[ctx.t.cancel]]).resize());
}

async function handlePresetPhoto(ctx) {
  const action = ctx.session.adminAction;
  if (!action || action.type !== 'add_preset_photo') return false;
  const photo = ctx.message?.photo;
  if (!photo) return false;
  action.presetFileId = photo[photo.length - 1].file_id;
  action.type = 'add_preset_name';
  await ctx.reply(ctx.t.presetNamePrompt, adminCancelKeyboard);
  return true;
}

async function handlePresetName(ctx) {
  const action = ctx.session.adminAction;
  if (!action || action.type !== 'add_preset_name') return false;
  const name = ctx.message?.text?.trim();
  const t = ctx.t;
  if (!name) { await ctx.reply(t.presetNameEmpty, adminCancelKeyboard); return true; }
  await photoPresetService.create(name, action.presetFileId);
  delete ctx.session.adminAction;
  await ctx.reply(t.presetCreated(name), { parse_mode: 'HTML', ...adminMenuKeyboard(t) });
  return true;
}

async function deletePreset(ctx) {
  const presetId = parseInt(ctx.match[1]);
  await ctx.answerCbQuery(ctx.t.presetDeleted);
  try {
    await photoPresetService.delete(presetId);
    await showPhotoPresetsSettings(ctx);
  } catch (error) {
    await ctx.reply(ctx.t.errorGeneric(error.message), adminMenuKeyboard(ctx.t));
  }
}

async function requestAdminAccess(ctx) {
  const user = ctx.state.user;
  const t = ctx.t;
  if (!user?.fullName || !user?.phone) return ctx.reply(t.registerFirst);
  if (user.isAdmin || user.isSubAdmin) return ctx.reply(t.alreadyModerator);
  if (user.adminRequest) return ctx.reply(t.requestPending);

  await userService.requestAdminAccess(user.telegramId);

  try {
    const { getT } = require('../../utils/i18n');
    const { prisma } = require('../../config/database');
    const adminUser = await prisma.user.findFirst({ where: { telegramId: String(config.bot.adminId) } });
    const adminT = getT(adminUser?.language || 'ru');
    await notificationService.bot.telegram.sendMessage(
      config.bot.adminId,
      adminT.newModeratorRequest(user),
      { parse_mode: 'HTML' },
    );
  } catch (_) {}

  await ctx.reply(t.requestSent);
}

module.exports = {
  showSettings, showSubAdmins, showAdminRequests,
  approveSubAdmin, denySubAdmin, revokeSubAdmin,
  showPhotoPresetsSettings, startAddPreset, handlePresetPhoto, handlePresetName, deletePreset,
  requestAdminAccess,
};
