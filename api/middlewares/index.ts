import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { IncomingMessage, ServerResponse } from 'http';


export const initializeMiddlewares = (app: express.Application) => {
  // CORS setup
  const corsOptions = {
    origin: process.env.FRONT_URL, // set '*' to allow all
    allowedHeaders: ["X-Requested-With", "Authorization", "Content-Type"],
  };
  app.use(cors(corsOptions));

  // Helmet setup
  app.use(
    helmet({
      frameguard: { action: "sameorigin" },
    })
  );
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "wss:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'self'"],
      },
    })
  );

  // Body-parser setup
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Rate limiter setup
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);

  // Morgan setup
  morgan.token("remote-addr", function (req: IncomingMessage, _res: ServerResponse) {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") return forwardedFor.split(",")[0];
    return req.connection.remoteAddress || "";
  });
  morgan.format("custom", '[:date[clf]] ":method :url" :status :remote-addr - :response-time ms');
  if (process.env.NODE_ENV === "production") {
    let accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });
    app.use(morgan("custom", { stream: accessLogStream }));
  } else 
    app.use(morgan("custom"));
  
};
