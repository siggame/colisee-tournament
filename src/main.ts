import * as dotenv from "dotenv";
// needs to be executed before any db connections are established
dotenv.config();

import { App } from "./app";
import * as db from "./dbUtil";


let app = new App();

app.prepareTournament(true, false)
    .then(tourney => {
        tourney.once("on_finished", () => {
            console.log(tourney.results);
        });

        tourney.once("error", (err) => {
            console.log(err);
            tourney.stop();
        });

        tourney.play(
            match => {
                return db.createGame(match.teams)
                    .then(game => {
                        //TODO: how THE FUCK do I wait until I get a result
                        return app.poll(game.id);
                    })
                    .catch(err => {
                        console.log(err);
                        tourney.stop();
                    });
            },
            match => {
                console.log(match);
            },
            (match, err) => {
                console.log(err);
            });
    })
    .catch(err => err);

