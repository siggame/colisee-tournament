import { db } from "@siggame/colisee-lib";
import { IMatchResult, SingleEliminationTournament as SETourney } from "@siggame/tourneyjs";
import { Request, RequestHandler } from "express";
import { BadRequest, Conflict, InternalServerError, NotFound } from "http-errors";
import { JoinClause, QueryBuilder } from "knex";
import { isNil, isString } from "lodash";
import * as winston from "winston";

import { catchError } from "./helpers";
import { scheduler, TournamentScheduler } from "./tournament";

function assertNameExists(req: Request) {
    if (isNil(req.params.name)) {
        throw new BadRequest("Name must be given");
    } else if (!isString(req.params.name)) {
        throw new BadRequest("Name must be a string");
    }
}

async function getEligibleSubmissions() {
    const eligibleTeamIds = await db.connection("teams")
        .select("id")
        .where({ is_eligible: true })
        .then((rows: { id: number }[]) => rows.map((row) => row.id));
    const submissions = await db.connection
        .select("submissions.id", "submissions.team_id", "submissions.image_name",
        "submissions.status", "submissions.created_at", "submissions.updated_at")
        .from(function (this: QueryBuilder) {
            this.from("submissions as subs")
                .select("subs.id as subId", "subs.team_id as teamId", db.connection.raw("max(subs.version) as recent_version"))
                .where({ status: "finished" })
                .groupBy("subId")
                .as("recent_subs");
        }).join("submissions", function (this: JoinClause) {
            this.on("recent_subs.teamId", "submissions.team_id").andOn("recent_subs.recent_version", "submissions.version");
        }).whereIn("submissions.team_id", eligibleTeamIds)
        .then(db.rowsToSubmissions);
    return submissions;
}

export const createTournament: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.tournaments.has(req.params.name)) {
            throw new Conflict(`Tournament with name ${req.params.name} already exists`);
        }
        const tourney = new SETourney(await getEligibleSubmissions(), req.body.settings);
        scheduler.tournaments.set(req.params.name, tourney);
        tourney.on("finished",
            ([{ winner: first, losers: [second] }, bronzeFinal]: IMatchResult<db.Submission>[]) => {
                winston.info(`Winner: ${first.teamId}`);
                winston.info(`Runner Up: ${second.teamId}`);
                if (bronzeFinal) {
                    const { winner: third, losers: [fourth] } = bronzeFinal;
                    winston.info(`Third: ${third.teamId}`);
                    winston.info(`Fourth: ${fourth.teamId}`);
                }
            });
        scheduler.play(req.params.name);
        winston.info(`number of tourneys scheduled: ${scheduler.tournaments.size}`);
        res.json(tourney.teams);
    });

export const tournamentPause: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.pause(req.params.name)) {
            res.send(`Tournament, ${req.params.name}, was successfully paused.`);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
        res.end();
    });

export const tournamentRemove: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.remove(req.params.name)) {
            res.send(`Tournament, ${req.params.name}, was successfully removed.`);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
        res.end();
    });

export const tournamentResume: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.resume(req.params.name)) {
            res.send(`Tournament, ${req.params.name}, was successfully resumed.`);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
        res.end();
    });

export const tournamentStatus: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        const tourney = scheduler.tournaments.get(req.params.name);
        if (tourney) {
            res.json({ name: req.params.name, tourneyStatus: tourney.status });
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
    });

export const tournamentStatuses: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        res.json([...scheduler.tournaments.entries()].map(([name, tourney]) => {
            const tourneyStatus = tourney.toString();
            return { name, tourneyStatus };
        }));
        res.end();
    });
