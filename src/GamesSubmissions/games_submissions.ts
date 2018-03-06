import { db } from "@siggame/colisee-lib";

interface ICreateGameSubmission {
    game_id: number;
    submission_id: number;
}

export function createGameSubmissions(games_submissions: ICreateGameSubmission[]) {
    return new Promise<void>((res, rej) => {
        db.connection("games_submissions")
            .insert(games_submissions)
            .then(() => res())
            .catch(rej);
    }).catch((error) => { throw error; });
}
