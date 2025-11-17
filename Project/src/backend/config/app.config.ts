/**
 * Application Configuration
 */

export default () => ({
  // Server
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },

  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  // Redis (optional)
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },

  // AI Services
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
    },
    perspective: {
      apiKey: process.env.GOOGLE_PERSPECTIVE_API_KEY,
    },
  },

  // Rate Limiting
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  // Game Settings
  game: {
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'tr-TR',
    supportedLanguages: process.env.SUPPORTED_LANGUAGES?.split(',') || ['tr-TR', 'en-US'],
    matchmakingTimeout: parseInt(process.env.MATCHMAKING_TIMEOUT, 10) || 60,
    maxMmrSpread: parseInt(process.env.MAX_MMR_SPREAD, 10) || 200,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },

  // Features
  features: {
    telemetryEnabled: process.env.TELEMETRY_ENABLED === 'true',
    mockAiServices: process.env.MOCK_AI_SERVICES === 'true',
  },
});
