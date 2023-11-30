import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';

import morgan from 'morgan';
import passport from 'passport';

// Import your routes and middleware
// import validateToken from './yourValidateTokenPath';
// import userRoutes from './yourUserRoutesPath';
// import authRoutes from './yourAuthRoutesPath';
// import tourRoutes from './yourTourRoutesPath';
// import reviewsRoutes from './yourReviewsRoutesPath';
// import tasksRoutes from './yourTasksRoutesPath';
// import issueRoutes from './yourIssueRoutesPath';
// import projectRoutes from './yourProjectRoutesPath';
// import notificationRoutes from './yourNotificationRoutesPath';
// import errorController from './yourErrorControllerPath';

// Import swagger dependencies and document
import { dirname } from 'path';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { corsUrl, environment } from '../config.js';
import {
  ApiError,
  ErrorType,
  InternalError,
  NotFoundError,
} from '../core/ApiError.js';
import Logger from '../core/Logger.js';
import routes from '../routes/index.js';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

interface CustomRequest extends Request {
  requestTime?: string;
}

const expressLoader = (app: Application): void => {
  try {
    app.use('/api', limiter);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    }
    app.use(express.json({ limit: '10mb' }));
    app.use(
      express.urlencoded({
        limit: '10mb',
        extended: true,
        parameterLimit: 50000,
      }),
    );
    app.use(cors({ origin: corsUrl, optionsSuccessStatus: 200 })); // cross-origin

    app.use('/', routes);
    // catch 404 and forward to error handler
    app.use((req, res, next) => next(new NotFoundError()));

    // Set security headers using helmet
    app.use(helmet());

    app.use(passport.initialize());
    app.use(passport.session() as express.RequestHandler);

    // Data sanitization against NoSql query injection
    app.use(mongoSanitize());
    // Data sanitization against XSS
    // app.use(xss('', {}));
    // Prevent parameter pollution
    app.use(
      hpp({
        whitelist: [
          'duration',
          'ratingAverage',
          'average',
          'maxGroupSize',
          'difficulty',
          'price',
        ],
      }),
    );
    // In ECMAScript modules (ESM), __dirname and __filename are not available as they are in CommonJS modules
    // using the import.meta.url property to achieve a similar result.
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    // Serving static files
    app.use(express.static(`${__dirname}/public`));

    // Test middleware
    app.use((req: CustomRequest, res: Response, next: NextFunction) => {
      req.requestTime = new Date().toISOString();
      // console.log(req.headers);
      next();
    });

    //   app.use('/api/v1', validateToken); // Apply validateToken middleware to all routes starting with /api/v1
    // catch 404 and forward to error handler
    // Routes
    // app.use('/api', routes);
    //   app.use('/api/v1/auth', authRoutes);
    //   app.use('/api/v1/tour', tourRoutes);
    //   app.use('/api/v1/reviews', reviewsRoutes);
    //   app.use('/api/v1/tasks', tasksRoutes);
    //   app.use('/api/v1/issue', issueRoutes);
    //   app.use('/api/v1/project', projectRoutes);
    //   app.use('/api/v1', notificationRoutes);

    // Swagger setup
    app.use('/api-docs', swaggerUi.serve);
    //   app.get('/api-docs', swaggerUi.setup(swaggerDocument));

    // Port and server initialization
    app.set('port', process.env.PORT);

    // Custom error handler middleware
    //   app.use(errorController);
    // Middleware Error Handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      if (err instanceof ApiError) {
        console.log('in error');
        ApiError.handle(err, res);
        if (err.type === ErrorType.INTERNAL)
          Logger.error(
            `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
          );
      } else {
        Logger.error(
          `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
        );
        Logger.error(err);
        if (environment === 'development') {
          console.log('first', err);

          return res.status(500).send(err);
        }
        ApiError.handle(new InternalError(), res);
      }
    });
  } catch (error) {
    console.log('on error', error);
  }
};

export default expressLoader;
