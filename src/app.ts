import * as dotenv from "dotenv";
dotenv.config();

import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "http-errors";
import * as winston from "winston";

import * as tournament from "./Tournament";
import { PORT } from "./vars";

winston.configure({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
    }),
  ],
});

const errorHandler: ErrorRequestHandler = (err: HttpError, req, res, next) => {
  winston.error(err.toString());
  res.status(err.statusCode).end(err.message);
};

const logger: RequestHandler = (req, res, next) => {
  winston.info(`${req.method}\t${req.url}`);
  next();
};

const app = express();

app.use(cors());
app.use(logger);
app.use(errorHandler);

app.post("/create/:name", bodyParser.json(), tournament.create);
app.get("/pause/:name", tournament.pause);
app.delete("/remove/:name", tournament.remove);
app.get("/resume/:name", tournament.resume);
app.get("/status/:name", tournament.status);
app.get("/status", tournament.statuses);

export default () => {
  app.listen(PORT, () => {
    winston.info(`Listening on port ${PORT}...`);
  });
};

export { app };
