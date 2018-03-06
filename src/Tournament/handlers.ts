import { db } from "@siggame/colisee-lib";
import { IMatchResult, SingleEliminationTournament as SETourney } from "@siggame/tourneyjs";
import { RequestHandler } from "express";
import { Conflict, InternalServerError, NotFound } from "http-errors";
import * as winston from "winston";

import { assertNameExists, catchError } from "../helpers";
import { getEligibleSubmissions } from "../Submissions";
import { scheduler } from "../Tournament";

export const create: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.tournaments.has(req.params.name)) {
            throw new Conflict(`Tournament with name ${req.params.name} already exists`);
        }
        const eligibleSubmissions = await getEligibleSubmissions()
            .catch((error) => {
                throw new InternalServerError();
            });
        const tourney = new SETourney(eligibleSubmissions, req.body.settings);
        scheduler.tournaments.set(req.params.name, tourney);
        scheduler.play(req.params.name);
        res.json(tourney.teams);
        res.end();
        const [{ winner: first, losers: [second] }, bronzeFinal] = await new Promise<IMatchResult<db.Submission>[]>((res, rej) => {
            tourney.on("finished", res);
            tourney.on("error", rej);
        }).catch((error) => { winston.error(`tournament ${req.params.name} failed`); throw error; });
        winston.info(`Winner: ${first.teamId}`);
        winston.info(`Runner Up: ${second.teamId}`);
        if (bronzeFinal) {
            const { winner: third, losers: [fourth] } = bronzeFinal;
            winston.info(`Third: ${third.teamId}`);
            winston.info(`Fourth: ${fourth.teamId}`);
        }
        winston.info(`number of tourneys scheduled: ${scheduler.tournaments.size}`);
    });

export const pause: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.pause(req.params.name)) {
            res.send(`Tournament, ${req.params.name}, was successfully paused.`);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
        res.end();
    });

export const remove: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.remove(req.params.name)) {
            res.send(`Tournament, ${req.params.name}, was successfully removed.`);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
        res.end();
    });

export const resume: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        if (scheduler.resume(req.params.name)) {
            res.send(`Tournament, ${req.params.name}, was successfully resumed.`);
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
        res.end();
    });

export const status: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        assertNameExists(req);
        const tourney = scheduler.tournaments.get(req.params.name);
        if (tourney) {
            res.json({ name: req.params.name, tourneyStatus: tourney.status });
        } else {
            throw new NotFound(`No tournament with name ${req.params.name}`);
        }
    });

export const statuses: RequestHandler =
    catchError<RequestHandler>(async (req, res, next) => {
        res.json([...scheduler.tournaments.entries()].map(([name, tourney]) => {
            const tourneyStatus = tourney.toString();
            return { name, tourneyStatus };
        }));
        res.end();
    });    
