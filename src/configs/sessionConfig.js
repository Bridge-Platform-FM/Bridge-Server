'use strict';

/**
 * SESSION_LIMIT_ENABLED=true  -> session tracking + per-request enforcement ON
 * SESSION_LIMIT_ENABLED=false -> per-request DB session check skipped (pure
 *                                 stateless JWT verification, as before this
 *                                 feature existed); max-session eviction at
 *                                 login also skipped.
 * MAX_ACTIVE_SESSIONS         -> integer, defaults to 3 if unset/invalid.
 */
const SESSION_LIMIT_ENABLED = String(process.env.SESSION_LIMIT_ENABLED).toLowerCase() === 'true';

const parsedMax = parseInt(process.env.MAX_ACTIVE_SESSIONS, 10);
const MAX_ACTIVE_SESSIONS = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 3;

module.exports = {
  SESSION_LIMIT_ENABLED,
  MAX_ACTIVE_SESSIONS,
};
