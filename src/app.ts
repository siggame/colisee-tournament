import * as dotenv from "dotenv";
dotenv.config();

import * as bodyParser from "body-parser";
import * as cors from "cors";
import { ErrorRequestHandler, RequestHandler } from "express";
import * as express from "express";
import { HttpError } from "http-errors";
import * as winston from "winston";

import { createTournament, tournamentStatus, tournamentStatuses } from "./handlers";
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
app.get("/status/:name", tournamentStatus);
app.get("/status", tournamentStatuses);
app.get("/start/:name", (req, res) => { res.end(); });
app.get("/stop/:name", (req, res) => { res.end(); });

export default () => {
  app.listen(PORT, () => {
    winston.info(`Listening on port ${PORT}...`);
  });
};

export { app };
