import { db } from "@siggame/colisee-lib";
import { ITournament } from "@siggame/tourneyjs";

export class TournamentScheduler {

    public tournaments: Map<string, ITournament<db.Submission>>;

    constructor() {
        this.tournaments = new Map<string, ITournament<db.Submission>>();
    }
}
