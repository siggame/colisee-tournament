import { db } from "@siggame/colisee-lib";
import * as winston from "winston";

interface ITeamFilter {
    is_eligible: boolean;
}

export function getTeamIds(filter: ITeamFilter) {
    return new Promise<number[]>((res, rej) => {
        db.connection("teams")
            .select("id")
            .where(filter)
            .then((ids: { id: number }[]) => { res(ids.map(({ id }) => id)); })
            .catch(rej);
    }).catch((error) => { winston.error("Eligible teams error"); throw error; });
}
