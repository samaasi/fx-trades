export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'fx_trade',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secretKey',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || '"FX Trade" <noreply@fxtrade.com>',
  },
  fx: {
    exchangeRate: {
      apiKey: process.env.FX_API_KEY,
      baseUrl: process.env.FX_BASE_URL || 'https://v6.exchangerate-api.com/v6/',
      cacheTtl: parseInt(process.env.FX_CACHE_TTL ?? '3600', 10),
      staleTtl: parseInt(process.env.FX_STALE_TTL ?? '86400', 10), // 24 hours default
    },
  },
});
