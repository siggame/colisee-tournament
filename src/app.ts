import * as dotenv from "dotenv";
dotenv.config();

import * as bodyParser from "body-parser";
import * as cors from "cors";
import { ErrorRequestHandler, RequestHandler } from "express";
import * as express from "express";
import { HttpError } from "http-errors";
import * as winston from "winston";

import { createTournament, tournamentStatus } from "./handlers";
import { PORT } from "./vars";

winston.configure({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
    }),
  ],
});

const app = express();

const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  winston.error(err.toString());
  res.status(err.statusCode).end(err.message);
};

const logger: RequestHandler = (req, res, next) => {
  winston.info(`${req.method}\t${req.url}`);
  next();
};

app.use(cors());
app.use(logger);
app.use(errorHandler);

app.post("/create/:name", bodyParser.json(), createTournament);
app.post("/status/:name", tournamentStatus);

export default () => {
  app.listen(PORT, () => {
    winston.info(`Listening on port ${PORT}...`);
  });
};

export { app };
