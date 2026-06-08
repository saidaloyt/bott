const config = require('../config');

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = config.app.isDev ? LOG_LEVELS.debug : LOG_LEVELS.info;

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] > currentLevel) return;
  const timestamp = new Date().toISOString();
  const prefix = { error: '❌', warn: '⚠️', info: 'ℹ️', debug: '🔍' }[level];
  const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  console.log(`[${timestamp}] ${prefix} [${level.toUpperCase()}] ${message}${metaStr}`);
}

module.exports = {
  error: (msg, meta) => log('error', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  info: (msg, meta) => log('info', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
};
