import { db } from "@siggame/colisee-lib";
import { IMatchResult, SingleEliminationTournament as SETourney } from "@siggame/tourneyjs";
import { Request, RequestHandler } from "express";
import { BadRequest, Conflict, NotFound } from "http-errors";
import { JoinClause, QueryBuilder } from "knex";
import { isNil, isString } from "lodash";
import * as winston from "winston";

import { catchError } from "./helpers";
import { TournamentScheduler } from "./tournament";

export const scheduler = new TournamentScheduler();

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
    catchError(async (req: Request, res, next) => {
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
                tourney.resume();
                if (bronzeFinal) {
                    const { winner: third, losers: [fourth] } = bronzeFinal;
                    winston.info(`Third: ${third.teamId}`);
                    winston.info(`Fourth: ${fourth.teamId}`);
                    scheduler.stop(req.params.name);
                }
            }).when("error", () => {
                scheduler.stop(req.params.name);
            });
        scheduler.play(req.params.name);
        winston.info(`number of tourneys scheduled: ${scheduler.tournaments.size}`);
        res.json(tourney.teams);
    });

export const tournamentStatus: RequestHandler =
    catchError(async (req, res, next) => {
        assertNameExists(req);
        const tourney = scheduler.tournaments.get(req.params.name);
        if (tourney) {
            res.json([req.params.name, tourney.status]);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
    });

export const tournamentStatuses: RequestHandler =
    catchError(async (req, res, next) => {
        res.json([...scheduler.tournaments.entries()].map(([name, tourney]) => {
            return [name, tourney.status];
        }));
        res.end();
    });
