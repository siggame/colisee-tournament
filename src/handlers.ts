import { db } from "@siggame/colisee-lib";
import { RequestHandler } from "express";
import { BadRequest, NotFound } from "http-errors";
import * as _ from "lodash";
import * as winston from "winston";

import { wrap } from "./helpers";

const assertNameExists: RequestHandler =
    (req, res, next) => {
        if (_.isNil(req.params.name)) {
            throw new BadRequest("Name must be given");
        } else if (!_.isString(req.params.name)) {
            throw new BadRequest("Name must be a string");
        }
        next();
    };

export const createTournament: RequestHandler[] = [
    assertNameExists,
    wrap(async (req, res, next) => {
        const teams = await db.connection("teams")
            .then(db.rowsToTeams)
            .catch((e: Error) => { throw e; });
        res.end(`created tournament named ${req.params.name}`);
    }),
];

export const tournamentStatus: RequestHandler[] = [
    assertNameExists,
    (req, res, next) => {
        res.send(`found tournament ${req.params.name}`);
    },
];
