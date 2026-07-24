import "dotenv/config";
import app from "./app";
import { env } from "./shared/config/env";
import { connectDatabase } from "./shared/config/database";

const startServer = async (): Promise<void> => {
  try {
    // Connect Database
    await connectDatabase();

    // Start Express Server
    app.listen(env.PORT, () => {
      console.log(`
====================================
🚀 Server running successfully
🌐 URL  : http://localhost:${env.PORT}
📦 ENV  : ${env.NODE_ENV}
====================================
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);

    process.exit(1);
  }
};

startServer();