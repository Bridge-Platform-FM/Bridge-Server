'use strict';

/*
 * Central place for the httpOnly auth cookies. No external dependency:
 *  - setting uses Express's built-in res.cookie()
 *  - reading parses the raw Cookie header (works for both HTTP requests and the
 *    Socket.io handshake, which has no cookie-parser)
 */

const env = require('../configs/env_configs');

const COOKIE_NAMES = {
    ACCESS: 'accessToken',
    REFRESH: 'refreshToken',
    MFA: 'mfaToken',
    RESET: 'resetToken'
};

/*
 * Convert a JWT-style timespan (e.g. '55m', '7d', '30s', '10m', or a bare number of
 * seconds — the jsonwebtoken convention) into milliseconds for a cookie maxAge.
 */
const toMs = (value) => {
    const match = String(value ?? '').trim().match(/^(\d+)\s*(ms|s|m|h|d)?$/i);
    if (!match) return 0;
    const amount = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase(); // bare number = seconds, matching jwt
    const mult = { ms: 1, s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit];
    return amount * mult;
};

// maxAge in ms — derived from the SAME env expiries the JWTs use, so cookie and token
// lifetimes can never drift. Tune via ACCESS_TOKEN_EXPIRY / REFRESH_TOKEN_EXPIRY /
// MFA_PENDING_EXPIRY / RESET_PASSWORD_EXPIRY in .env.
const MAX_AGE = {
    ACCESS: toMs(env.JWT.ACCESS_EXPIRY),
    REFRESH: toMs(env.JWT.REFRESH_EXPIRY),
    MFA: toMs(env.JWT.MFA_PENDING_EXPIRY),
    RESET: toMs(env.JWT.RESET_PASSWORD_EXPIRY)
};

// The refresh token is only ever sent to the refresh endpoint — nowhere else.
const REFRESH_PATH = '/api/v1/auth/refresh';

const baseOptions = () => ({
    httpOnly: true,
    secure: env.COOKIE.SECURE,
    sameSite: env.COOKIE.SAMESITE,
    ...(env.COOKIE.DOMAIN ? { domain: env.COOKIE.DOMAIN } : {})
});

/** Parse a raw Cookie header string into a { name: value } map. */
const parseCookieHeader = (header) => {
    const out = {};
    if (!header || typeof header !== 'string') return out;
    for (const part of header.split(';')) {
        const idx = part.indexOf('=');
        if (idx === -1) continue;
        const name = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        if (name) out[name] = decodeURIComponent(value);
    }
    return out;
};

/** Read a single cookie value from an Express request (no cookie-parser needed). */
const getCookie = (req, name) => {
    if (req.cookies && req.cookies[name]) return req.cookies[name]; // if cookie-parser is ever added
    return parseCookieHeader(req.headers && req.headers.cookie)[name] || null;
};

/**
 * Resolve the bearer token for a request: prefer the httpOnly cookie, fall back to
 * the Authorization header. The header fallback keeps un-migrated clients working
 * during the cookie rollout.
 */
const readToken = (req, cookieName) => {
    const fromCookie = getCookie(req, cookieName);
    if (fromCookie) return fromCookie;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
    return null;
};

const setAuthCookies = (res, { accessToken, refreshToken }) => {
    if (accessToken) {
        res.cookie(COOKIE_NAMES.ACCESS, accessToken, { ...baseOptions(), path: '/', maxAge: MAX_AGE.ACCESS });
    }
    if (refreshToken) {
        res.cookie(COOKIE_NAMES.REFRESH, refreshToken, { ...baseOptions(), path: REFRESH_PATH, maxAge: MAX_AGE.REFRESH });
    }
};

const setAccessCookie = (res, accessToken) => {
    res.cookie(COOKIE_NAMES.ACCESS, accessToken, { ...baseOptions(), path: '/', maxAge: MAX_AGE.ACCESS });
};

const setMfaCookie = (res, mfaToken) => {
    res.cookie(COOKIE_NAMES.MFA, mfaToken, { ...baseOptions(), path: '/', maxAge: MAX_AGE.MFA });
};

const clearMfaCookie = (res) => {
    res.clearCookie(COOKIE_NAMES.MFA, { ...baseOptions(), path: '/' });
};

const setResetCookie = (res, resetToken) => {
    res.cookie(COOKIE_NAMES.RESET, resetToken, { ...baseOptions(), path: '/', maxAge: MAX_AGE.RESET });
};

/** Clear every auth cookie — used at logout and after a completed password reset. */
const clearAuthCookies = (res) => {
    res.clearCookie(COOKIE_NAMES.ACCESS, { ...baseOptions(), path: '/' });
    res.clearCookie(COOKIE_NAMES.REFRESH, { ...baseOptions(), path: REFRESH_PATH });
    res.clearCookie(COOKIE_NAMES.MFA, { ...baseOptions(), path: '/' });
    res.clearCookie(COOKIE_NAMES.RESET, { ...baseOptions(), path: '/' });
};

module.exports = {
    COOKIE_NAMES,
    parseCookieHeader,
    getCookie,
    readToken,
    setAuthCookies,
    setAccessCookie,
    setMfaCookie,
    clearMfaCookie,
    setResetCookie,
    clearAuthCookies
};
