export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  database: {
    uri: process.env.DATABASE || 'mongodb://127.0.0.1:27017/secure-notes-api',
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      'secure_notes_access_secret_key_12345',
    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN ||
      process.env.JWT_EXPIRES_IN ||
      '15m',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || 'secure_notes_refresh_secret_key_67890',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.FROM_EMAIL || '"Secure Notes API" <noreply@securenotes.com>',
  },
});
