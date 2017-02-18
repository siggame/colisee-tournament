const _ = require('lodash');
import * as logger from "./logger";
import * as db from "./dbUtil";
import { SingleElimination as single, Settings as settings } from "../node_modules/tourneyjs";

export class App {
  tournament: single;

  constructor() { }

  prepareTournament(settings?: settings): Promise<single> {
    return new Promise((resolve, reject) => {
      db.getTeams()
        .then((teams: any[]) => {
          const team_ids = teams.map((team) => { return team.id });
          this.tournament = new single(team_ids, settings);
          return this.tournament
        })
        .then(resolve)
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
