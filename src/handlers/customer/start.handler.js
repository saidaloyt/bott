const { langKeyboard, mainMenuKeyboard } = require('../../keyboards/customer');

async function startHandler(ctx) {
  const user = ctx.state.user;

  // STEP 1: Language selection ALWAYS comes first
  // Show it if: no language set, or no registration complete
  if (!user?.fullName || !user?.phone) {
    // Clear any stale session state
    delete ctx.session.registration;
    delete ctx.session.checkout;
    delete ctx.session.awaitingSearch;
    delete ctx.session.awaitingLoginCode;

    return ctx.reply(ctx.t.chooseLanguage, langKeyboard);
  }

  // Fully registered — show main menu
  const t = ctx.t;
  return ctx.reply(
    t.loginSuccess(user.fullName),
    { parse_mode: 'HTML', ...mainMenuKeyboard(t) },
  );
}

async function helpHandler(ctx) {
  const t = ctx.t;
  return ctx.reply(
    `ℹ️ <b>Help</b>\n\n/start — Main menu\n/admin — Admin panel\n/moderator — Request moderator access`,
    { parse_mode: 'HTML' },
  );
}

module.exports = { startHandler, helpHandler };
