import * as chai from 'chai';
import * as db from "../../src/dbUtil";
import { App } from "../../src/app";
const _ = require('lodash');

describe('Example Unit Tests', function () {

    const app = new App();

    const initialTeams = [
        { gitlab_id: 1 },
        { gitlab_id: 2 },
        { gitlab_id: 3 },
    ]

    before('Populate the database with users', function () {
        const ps = [];
        initialTeams.forEach((team) => {
            ps.push(db.query("team").insert({ gitlab_id: team.gitlab_id }));
        });

        return Promise.all(ps)
    });


    it('should be able to poll for updated game', (done) => {
        db.createGame([1, 2]).then(game => {
            setTimeout(() => db.query('team_game')
                .where({ game_id: game.id })
                .then((team_games: any[]) => {
                    team_games.map((team_game, i) => {
                        db.query("team_game").where({
                            team_id: team_game.team_id,
                            game_id: team_game.game_id
                        }).update({
                            winner: team_game.id % 2 == 0
                        })
                    })
                }), 1000);
            return game.id;
        }).then(game_id => app.poll(game_id).then(_ => done()));
    });
});
