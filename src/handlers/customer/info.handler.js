const { mainMenuKeyboard } = require('../../keyboards/customer');

async function showAbout(ctx) {
  const t = ctx.t;
  await ctx.reply(
    `${t.aboutTitle}\n\n${t.aboutBody}`,
    { parse_mode: 'HTML', ...mainMenuKeyboard(t) },
  );
}

async function showContacts(ctx) {
  const t = ctx.t;
  await ctx.reply(
    `${t.contactsTitle}\n\n${t.contactsBody}`,
    { parse_mode: 'HTML', ...mainMenuKeyboard(t) },
  );
}

module.exports = { showAbout, showContacts };
