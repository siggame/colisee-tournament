import { db } from "@siggame/colisee-lib";
import { ITournament } from "@siggame/tourneyjs";
import * as winston from "winston";

import { delay } from "./helpers";

const CREATE = -1;

export class TournamentScheduler {

    public tournaments: Map<string, ITournament<db.Submission>>;

    constructor() {
        this.tournaments = new Map<string, ITournament<db.Submission>>();
    }

    play(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.play(async (match) => {
                if (match.id === CREATE) {
                    match.id = await db.connection("games")
                        .insert({ status: "queued" }, "*")
                        .then(db.rowsToGames)
                        .then(([{ id }]) => id)
                        .catch((e) => { throw e; });
                    const gameSubmissions = match.teams.map(({ id: subId }) => ({ game_id: match.id, submission_id: subId }));
                    await db.connection("games_submissions")
                        .insert(gameSubmissions)
                        .catch((e) => { throw e; });
                } else {
                    await db.connection("games").update({ status: "queued" }).where({ id: match.id });
                }

                let finishedGame: db.Game;
                while (true) {
                    [finishedGame] = await db.connection("games")
                        .where({ id: match.id })
                        .whereIn("status", ["failed", "finished"])
                        .then(db.rowsToGames);
                    if (finishedGame === undefined) {
                        await delay(100);
                    } else if (finishedGame && finishedGame.status === "failed") {
                        throw new Error("Game Failed");
                    } else {
                        break;
                    }
                }

                const winner = match.teams.reduce((winner, team) => (team.id === finishedGame.winnerId ? team : winner));
                const losers = match.teams.filter((team) => team.id !== finishedGame.winnerId);

                return { winner, losers };
            }, (match) => {
                winston.info(`Match ${match.id} completed`);
                winston.info(`${match}`);
            }, (match, error) => {
                winston.error(`${name} encountered a problem, attempting to recover`);
                winston.error(`${error.message} ${match}`);
                tournament.emit("enqueue", match);
                tournament.resume();
            });
            return true;
        } else {
            return false;
        }
    }

    stop(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.stop();
            return true;
        } else {
            return false;
        }
    }

    remove(name: string) {
        if (this.stop(name)) {
            return this.tournaments.delete(name);
        } else {
            return false;
        }
    }
}
