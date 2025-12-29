import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

async function execute() {
  try {
    // 1. connect to database

    // 2. start the server
    const server = app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });

    const closeServer = async () => {
      if (server) {
        server.close(async () => {
          console.log("Server is closing...");
          // 3. disconnect from database
          console.log("Database is disconnecting...");
        });
      } else {
        // 3. disconnect from database
        console.log("Database is not connected...");
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = async (error: Error) => {
      console.log("Unexpected error: ", error);
      // 3. disconnect from database

      await closeServer();
    };

    process.on("SIGINT", closeServer); // Ctrl + C
    process.on("SIGTERM", closeServer); // Terminate process
    process.on("SIGQUIT", closeServer); // Quit process
    process.on("uncaughtException", unexpectedErrorHandler); // Uncaught exception
    process.on("unhandledRejection", unexpectedErrorHandler); // Unhandled rejection

    return server;
  } catch (error) {
    console.error("Error starting the server:", error);
  }
}

execute();
