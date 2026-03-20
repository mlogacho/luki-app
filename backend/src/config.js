require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Refuse to start in production with placeholder JWT secrets
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';

if (isProduction && (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET)) {
  console.error(
    '\n❌ FATAL: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set in production.\n' +
    '   Generate them with:\n' +
    '     node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n'
  );
  process.exit(1);
}

// Development fallbacks (insecure — only for local use)
const DEV_ACCESS_SECRET = JWT_ACCESS_SECRET || 'dev_only_access_secret_DO_NOT_USE_IN_PROD';
const DEV_REFRESH_SECRET = JWT_REFRESH_SECRET || 'dev_only_refresh_secret_DO_NOT_USE_IN_PROD';

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV,

  // JWT
  JWT_ACCESS_SECRET: DEV_ACCESS_SECRET,
  JWT_REFRESH_SECRET: DEV_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_DAYS: 7,

  // Database
  DB_PATH: process.env.DB_PATH || './data/luki.db',

  // SMTP — server-side only
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'Luki App',
  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || '',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};
