require('dotenv').config();

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET é obrigatório em produção.');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  port: Number(process.env.PORT) || 3333,
  jwtSecret: process.env.JWT_SECRET || 'chave-apenas-para-desenvolvimento',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
