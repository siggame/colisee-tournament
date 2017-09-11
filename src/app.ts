import * as dotenv from "dotenv";
dotenv.config();

import * as cors from "cors";
import { NextFunction, Request, Response } from "express";
import * as express from "express";
import { HttpError } from "http-errors";
import * as winston from "winston";

import * as handlers from "./handlers";
import { PORT } from "./vars";

winston.configure({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
    }),
  ],
});

const app = express();

app.use(cors());

app.use((req, res, next) => {
  winston.info(`${req.method} ${req.url}`);
  next();
});

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  winston.error(err.toString());
  res.status(err.statusCode).end(err.name);
});

app.post("/create/:name", ...handlers.createTournament);
app.post("/status/:name", ...handlers.tournamentStatus);

app.listen(PORT, () => {
  winston.info(`Listening on port ${PORT}...`);
});
