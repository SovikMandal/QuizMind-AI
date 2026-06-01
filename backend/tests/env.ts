// Set test env BEFORE any module (incl. config/env -> dotenv) loads.
// dotenv does not override already-defined vars, so these win.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://quizuser:quizpass@127.0.0.1:5434/quizapp_test";
process.env.REDIS_URL = "redis://127.0.0.1:6380/1";
process.env.JWT_ACCESS_SECRET = "test-access-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.BCRYPT_ROUNDS = "4";
process.env.COOKIE_SECURE = "false";
