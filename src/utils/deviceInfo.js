'use strict';
const UAParser = require('ua-parser-js');

/**
 * Parses a raw User-Agent header into the fields stored on a session row.
 * Never throws — falls back to "Unknown" labels so login/token generation
 * never fails because of a missing/odd User-Agent header.
 */
function parseDeviceInfo(userAgentString) {
  try {
    const result = UAParser(userAgentString || '');
    const browser = (result.browser && result.browser.name) || 'Unknown browser';
    const os = (result.os && result.os.name) || 'Unknown OS';
    return {
      deviceName: `${browser} on ${os}`,
      browser,
      os,
    };
  } catch (err) {
    return {
      deviceName: 'Unknown device',
      browser: 'Unknown browser',
      os: 'Unknown OS',
    };
  }
}

module.exports = { parseDeviceInfo };
