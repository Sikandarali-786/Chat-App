import { cleanEnv, port, str } from "envalid";
import dotenv from "dotenv";

dotenv.config();

export const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "production", "test"],
    }),

    PORT: port(),
    API_PREFIX: str(),
    MONGODB_URI: str(),
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    ACCESS_TOKEN_EXPIRES_IN: str(),
    REFRESH_TOKEN_EXPIRES_IN: str(),
    CLIENT_URL: str(),
});