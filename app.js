const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const hpp = require("hpp");

// requiring routes
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const ideaRouter = require("./routes/idea");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

// start express app
const app = express();

if (!process.env.JWT_SECRET) {
  console.error("ERROR 🔥");
  process.exit(1);
}

// global middlewares
// implement CORS
app.use(cors());

// Access-Control-Allow-Origin
app.options("*", cors());

// Set security HTTP headers
app.use(helmet());

// development logging
if (app.get("env") === "development") {
  app.use(logger("dev"));
}

// limit request from same API
const limiter = rateLimit({
  max: 2000,
  windowMs: 60 * 60 * 1000,
  message: "Too much requests from this IP. Please try again in an hour!",
});

app.use("/api", limiter);

// body Parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: ["title", "createdAt"],
  })
);

// compression middleware
app.use(compression());

// test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

// routes
app.use("/api/v1/ideas", ideaRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
