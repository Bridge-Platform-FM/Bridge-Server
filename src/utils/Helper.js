'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

// Generates a random 4-digit OTP
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

// Hash password using bcrypt
const hashPassword = async (password) => {
    const saltRounds = process.env.HASH_SALT_ROUNDS || 10;
    return await bcrypt.hash(password, Number(saltRounds));
};

// watermark data
const waterMarkFunction = (company_id, user_id) => {
    const date = new Date().toISOString().split('T')[0]
    return `Bridge |${company_id} | ${user_id} | ${date}`
}

const maskPhone = (phone) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "(+91 ••• ••• 4493)";
  return `••• ••• ${digits.slice(-4)}`;
}
 
const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "(j•••@company.com)";
  if (local.length <= 5) return `${local}@${domain}`;
  const hidden = local.length - 5; // 1 first char + 4 last chars revealed
  return `${local[0]}${".".repeat(hidden)}${local.slice(-4)}@${domain}`;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (uuid) => {
  return UUID_REGEX.test(uuid);
}

module.exports = {
    generateOTP,
    hashPassword,
    waterMarkFunction,
    maskPhone,
    maskEmail,
    isValidUUID
};
