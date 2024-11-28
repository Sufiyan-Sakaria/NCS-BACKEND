import express, { Request, Response, NextFunction } from "express";
import { globalErrorHandler } from "./middlewares/ErrorHandler"; // Make sure this import matches your actual export
import router from "./routes/index";
import { AppError } from "./utils/AppError";
import "dotenv/config";
import cors from "cors";

const app = express();
const Port = process.env.APP_PORT || 3000;

app.use(cors());

// Middleware to parse JSON
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome TO NCS Server");
});

// Use the routes from the index.ts router
app.use("/api/v1", router);

// Catch-all for unhandled routes (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handler middleware
app.use(globalErrorHandler);

app.listen(Port, () => {
  console.log(`Server is running on port : ${Port}`);
});
