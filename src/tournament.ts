import { db } from "@siggame/colisee-lib";
import { ITournament } from "@siggame/tourneyjs";
import * as winston from "winston";

import { delay } from "./helpers";

export class TournamentScheduler {

    public tournaments: Map<string, ITournament<db.Submission>>;

    constructor() {
        this.tournaments = new Map<string, ITournament<db.Submission>>();
    }

    play(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.play(async (match) => {
                const [game] = await db.connection("games")
                    .insert({ status: "queued" }, "*")
                    .then(db.rowsToGames)
                    .catch((e) => { throw e; });

                const gameSubmissions = match.teams.map(({ id: subId }) => ({ game_id: game.id, submission_id: subId }));
                await db.connection("games_submissions")
                    .insert(gameSubmissions)
                    .catch((e) => { throw e; });

                let finishedGame: db.Game;
                while (true) {
                    [finishedGame] = await db.connection("games")
                        .where({ id: game.id, status: "finished" })
                        .select("winner_id")
                        .then(db.rowsToGames);
                    if (finishedGame) {
                        break;
                    } else {
                        await delay(100);
                    }
                }

                const winner = match.teams.reduce((winner, team) => (team.id === finishedGame.winnerId ? team : winner));
                const losers = match.teams.filter((team) => team.id !== finishedGame.winnerId);

                return { winner, losers };
            }, (match) => {
                winston.info(`Match ${match.id} completed`);
                winston.info(`Teams: ${match.teams.map((team) => team.teamId)}`);
            }, (match, error) => {
                winston.error(`Fatal tournament error for ${name}`);
                winston.error(error.message);
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
            return this.tournaments.delete(name);
        } else {
            return false;
        }
    }
}
