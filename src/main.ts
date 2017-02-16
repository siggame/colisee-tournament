import * as dotenv from "dotenv";
// needs to be executed before any db connections are established
dotenv.config();

import { App } from "./app";
import * as logger from "./logger";
import * as db from "./dbUtil";
import { SingleElimination as single } from "../node_modules/tourneyjs"


let app = new App();

function fight(match) {
    return db.createGame(match.teams)
        .then(game => {
            return app.poll(game.id);
        })
}

function success(match) {
    console.log("Match ID: ", match.id, match.meta_data);
}

function error(match, err) {
    console.error("ERROR: ", err)
    for (const property in match) {
        console.error(match[property])
    }
}

export default function () {
    return app.prepareTournament(false, true)
        .then((tourney: single): single => {
            tourney.once("on_finished", () => {
                console.log("FINISHED: ", tourney.results.toString());
            });

            tourney.once("error", (err) => {
                console.error("ERROR: ", err, err.stack);
            });

            tourney.play(fight, success, error);
            return tourney
        })
        .catch(err => console.error("RIP: ", err));
}
