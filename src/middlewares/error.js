const logger = require('../utils/logger');

async function errorHandler(error, ctx) {
  logger.error('Unhandled bot error', {
    error: error.message,
    stack: error.stack,
    updateType: ctx.updateType,
    from: ctx.from?.id,
  });

  try {
    const message = ctx.t?.errorOccurred || '😔 Something went wrong. Please try again or send /start';
    await ctx.reply(message, { parse_mode: 'HTML' });
  } catch (replyError) {
    logger.error('Error while sending error message', { error: replyError.message });
  }
}

function asyncErrorWrapper(fn) {
  return async (ctx, next) => {
    try {
      await fn(ctx, next);
    } catch (error) {
      await errorHandler(error, ctx);
    }
  };
}

module.exports = { errorHandler, asyncErrorWrapper };
