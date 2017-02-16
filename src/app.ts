const _ = require('lodash');
import * as logger from "./logger";
import * as db from "./dbUtil";
import { SingleElimination as single } from "../node_modules/tourneyjs";

export class App {
    tournament: single;

    constructor() { }

    prepareTournament(with_bronze: boolean, randomize: boolean): Promise<single> {
        return new Promise((resolve, reject) => {
            db.getTeams()
                .then((teams: any[]) => {
                    const team_ids = teams.map((team) => { return team.id });
                    this.tournament = new single(team_ids, with_bronze, randomize);
                    resolve(this.tournament)
                })
                .catch(reject)
        })
    }

    poll(id: number) {
        return new Promise((resolve, reject) => {
            function recursive_poller() {
                return () => {
                    db.getFinishedGameResult(id)
                    .then(result => {
                        if (result === null) {
                            setTimeout(recursive_poller(), 250);
                        }
                        else {
                            resolve(result);
                        }
                    })
                    .catch(reject)
                }
            }
            setTimeout(recursive_poller(), 250);
        })
    }
}


