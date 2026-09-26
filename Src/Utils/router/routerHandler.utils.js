import cors from "cors";
import { globalErrorHandler } from "../../Middleware/errorHandler.middleware.js";
import { authRouter } from "../../Modules/Auth/auth.controller.js";
import { userRouter } from "../../Modules/User/profile.controller.js";

const allowedOrigins = process.env.ORIGIN_WHITE_LIST || [];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "refreshToken"],
};

export default function routerHandler(app, express) {
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use("/Assets", express.static("Assets"));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use(globalErrorHandler);
}
