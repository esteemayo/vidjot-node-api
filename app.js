/* eslint-disable */
import express from 'express';
import logger from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import cors from 'cors';
import compression from 'compression';
import hpp from 'hpp';
import dotenv from 'dotenv';

// requiring routes
import NotFoundError from './errors/notFound.js';
import ideaRouter from './routes/idea.js';
import globalErrorHandler from './controllers/errorController.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';

dotenv.config({ path: './config.env' });

// start express app
const app = express();

if (!process.env.JWT_SECRET) {
  console.error('ERROR 🔥');
  process.exit(1);
}

// global middlewares
// implement CORS
app.use(cors());

// Access-Control-Allow-Origin
app.options('*', cors());

// set security HTTP headers
app.use(helmet());

// development logging
if (app.get('env') === 'development') {
  app.use(logger('dev'));
}

// limit request from same API
const limiter = rateLimit({
  max: 2000,
  windowMs: 60 * 60 * 1000,
  message: 'Too much requests from this IP. Please try again in an hour!',
});

app.use('/api', limiter);

// body Parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: ['title', 'createdAt'],
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
app.use('/api/v1/ideas', ideaRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server.`));
});

app.use(globalErrorHandler);

export default app;
