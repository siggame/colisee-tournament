import { db } from "@siggame/colisee-lib";
import { ITournament } from "@siggame/tourneyjs";
import * as winston from "winston";

import { createGame, getEndedGame, updateGame } from "../Games";
import { createGameSubmissions } from "../GamesSubmissions";
import { delay } from "../helpers";

const CREATE = -1;

/**
 * Schedules tournaments and monitors progress of tournaments.
 * 
 * @export
 * @class TournamentScheduler
 */
export class TournamentScheduler {

    public tournaments: Map<string, ITournament<db.Submission>>;

    constructor() {
        this.tournaments = new Map<string, ITournament<db.Submission>>();
    }

    /**
     * Pauses tournament with given name.
     * 
     * @memberof TournamentScheduler
     */
    pause(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.pause();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Plays a match with given
     * 
     * @memberof TournamentScheduler
     */
    play(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.play(async (match) => {
                if (match.id === CREATE) {
                    match.id = await createGame("queued");
                    const gameSubmissions = match.teams.map(({ id: subId }) =>
                        ({ game_id: match.id, submission_id: subId }),
                    );
                    await createGameSubmissions(gameSubmissions);
                } else {
                    await updateGame("queued", { id: match.id });
                }

                let finishedGame: db.Game;
                while (true) {
                    [finishedGame] = await getEndedGame({ id: match.id });
                    if (finishedGame == null) {
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

    /**
     * Removes tournament with given name.
     * 
     * @memberof TournamentScheduler
     */
    remove(name: string) {
        if (this.stop(name)) {
            return this.tournaments.delete(name);
        } else {
            return false;
        }
    }

    /**
     * Resumes tournament with given name.
     * 
     * @memberof TournamentScheduler
     */
    resume(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.resume();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Stops tournament with given name.
     * 
     * @memberof TournamentScheduler
     */
    private stop(name: string) {
        const tournament = this.tournaments.get(name);
        if (tournament) {
            tournament.stop();
            return true;
        } else {
            return false;
        }
    }
}

export const scheduler = new TournamentScheduler();
