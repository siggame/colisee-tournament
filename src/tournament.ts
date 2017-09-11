import { db } from "@siggame/colisee-lib";
import { ITournament } from "@siggame/tourneyjs";

export class TournamentScheduler {

    public tournaments: ITournament<db.Submission>[];

    constructor() {
        this.tournaments = [];
    }
}
