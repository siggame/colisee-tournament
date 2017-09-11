import { db } from "@siggame/colisee-lib";
import { SingleEliminationTournament as SETourney } from "@siggame/tourneyjs";
import { RequestHandler } from "express";
import { BadRequest } from "http-errors";
import { JoinClause, QueryBuilder } from "knex";
import * as _ from "lodash";
import * as winston from "winston";

import { wrap } from "./helpers";
import { TournamentScheduler } from "./tournament";

export const scheduler = new TournamentScheduler();

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
        const submissions = await db.connection.from(function (this: QueryBuilder) {
            this.from("submissions as subs")
                .select("subs.id as subId", "subs.team_id as teamId", db.connection.raw("max(subs.version) as recent_version"))
                .where({ status: "finished" })
                .groupBy("subId")
                .as("recent_subs");
        }).join("submissions", function (this: JoinClause) {
            this.on("recent_subs.teamId", "submissions.team_id").andOn("recent_subs.recent_version", "submissions.version");
        }).select(
            "submissions.id",
            "submissions.team_id",
            "submissions.image_name",
            "submissions.status",
            "submissions.created_at",
            "submissions.updated_at",
        ).then(db.rowsToSubmissions);
        const tourney = new SETourney(submissions);
        scheduler.tournaments.push(tourney);
        winston.info(`number of tourneys scheduled: ${scheduler.tournaments.length}`);
        res.json(tourney.teams);
    }),
];

export const tournamentStatus: RequestHandler[] = [
    assertNameExists,
    (req, res, next) => {
        res.send(`found tournament ${req.params.name}`);
    },
];
