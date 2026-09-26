import express from "express";
import path from "path";
import { config } from "dotenv";

import { connectDB } from "./DB/connection.js";
import routerHandler from "./Utils/router/routerHandler.utils.js";

config({ path: path.resolve("Src/Config/.env.dev") });

const app = express();
const PORT = process.env.PORT || 5000;

routerHandler(app, express);

export default function bootstrapFunction() {
  connectDB();
  app
    .listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Please choose a different port.`
        );
      }
      console.error("Error starting server:", err);
    });
}
