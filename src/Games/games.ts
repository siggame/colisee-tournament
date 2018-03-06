import { db } from "@siggame/colisee-lib";
import * as winston from "winston";

interface IGameFilter {
    id: number;
}

export function createGame(status: db.GAME_STATUS_TYPE) {
    return new Promise<number>((res, rej) => {
        db.connection("games")
            .insert({ status }, "*")
            .then(db.rowsToGames)
            .then(([{ id }]) => id)
            .then(res)
            .catch(rej);
    }).catch((error) => { winston.error(`failed to create game with status ${status}`); throw error; });
}

export function getEndedGame(filter: IGameFilter) {
    return new Promise<db.Game[]>((res, rej) => {
        db.connection("games")
            .where(filter)
            .whereIn("status", ["failed", "finished"])
            .then(db.rowsToGames)
            .then(res)
            .catch(rej);
    }).catch((error) => { winston.error(`failed to get ended game ${filter}`); throw error; });
}

export function updateGame(status: db.GAME_STATUS_TYPE, filter: IGameFilter) {
    return new Promise<void>((res, rej) => {
        db.connection("games")
            .update({ status })
            .where(filter)
            .then(() => res())
            .catch(rej);
    }).catch((error) => { winston.error(`failed to update game with filter ${filter}`); throw error; });
}
