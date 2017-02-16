import * as db from "../../src/dbUtil";
import * as chai from "chai";

export default function () {

    describe('Database Tests', function () {

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

        it('should be able to create a game', function () {
            return db.createGame([1, 2])
                .then(game => {
                    chai.expect(game).to.exist;
                    chai.expect(game).has.property('id');
                })
        })

        it('should be able to get a finished game', function () {
            return db.createGame([1, 2])
                .then(game =>
                    db.query('game')
                        .where({ id: game.id })
                        .update({ status: "finished" })
                        .then(_ =>
                            db.query("team_game")
                                .where({ game_id: game.id })
                                .then(team_games => {
                                    let winner = Math.floor(Math.random() * 2) % 2;
                                    let ps = team_games.map(team_game => {
                                        winner ^= 1;
                                        return db.query("team_game")
                                            .where({ team_id: team_game.team_id, game_id: game.id })
                                            .update({ winner: Boolean(winner ^ 1) })
                                            .catch(console.error);
                                    });
                                    return Promise.all(ps)
                                        .catch(console.error);
                                })
                        )
                        .then(_ =>
                            db.getFinishedGameResult(game.id)
                                .then(result => {
                                    chai.expect(result).to.exist;
                                    chai.expect(result).has.property('winner');
                                }))
                )
        })

        after("Clean database", () => {
            db.query.select().from("team_game").delete();
            db.query.select().from("game").delete();
            db.query.select().from("team").delete();
        })
    });
}
