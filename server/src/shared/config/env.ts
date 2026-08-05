import { cleanEnv, port, str, num } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "production", "test"],
    }),

    PORT: port(),
    API_PREFIX: str(),
    MONGODB_URI: str(),

    // JWT
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    ACCESS_TOKEN_EXPIRES_IN: str(),
    REFRESH_TOKEN_EXPIRES_IN: str(),

    // Client
    CLIENT_URL: str(),

    // Bcrypt
    BCRYPT_SALT_ROUNDS: num(),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: str(),
    CLOUDINARY_API_KEY: str(),
    CLOUDINARY_API_SECRET: str(),

    // Email (for verify email + forgot password)
    SMTP_HOST: str(),
    SMTP_PORT: port(),
    SMTP_USER: str(),
    SMTP_PASS: str(),
    EMAIL_FROM: str(),
});
