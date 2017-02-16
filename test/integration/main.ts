import * as chai from "chai"
import * as db from "../../src/dbUtil"
import main from "../../src/main"
import { SingleElimination as single } from "../../node_modules/tourneyjs"

export default function () {
    describe("Main Tests", function () {

        function mockWorkers() {
            return () => {
                db.query("game").where({ status: "scheduled" })
                    .update({ status: "playing" })
                    .then(games => {
                        db.query.select().from(function () {
                            // join together all the info needed for a match
                            this.from("team_game as team_a")
                                .select(["team_a.winner as a_winner", "team_b.winner as b_winner",
                                    "team_a.team_id as a_id", "team_b.team_id as b_id",
                                    "team_a.game_id as match_id", "game.status as status"])
                                .join("team_game as team_b", function () {
                                    // join on game id
                                    this.on("team_a.game_id", "team_b.game_id")
                                        // avoid a_id == b_id and transposed a_id and b_id in
                                        // multiple rows
                                        .andOn("team_a.team_id", "<", db.query.raw("team_b.team_id"))
                                })
                                .join("game", "game.id", "team_a.game_id")
                                .where({ "game.status": "playing" })
                                .as("match")
                        }).then(matches => {
                            // update all matches and wait for them each to finish
                            return Promise.all(matches.map(match => {
                                // update all related match info and wait for each
                                // to finish
                                return Promise.all([
                                    db.query("team_game")
                                        .where({ team_id: match.a_id })
                                        .update({ winner: false }),
                                    db.query("team_game")
                                        .where({ team_id: match.b_id })
                                        .update({ winner: true }),
                                    db.query("game")
                                        .where({ id: match.match_id })
                                        .update({ status: "finished" })
                                ])
                            })).then(_ => setTimeout(mockWorkers(), 10))
                        })
                    })
                    //spit out error but continue to try and process matches
                    .catch(err => { console.log(err); setTimeout(mockWorkers(), 10) })
            }
        }

        const initialTeams = Array(100).fill(null).map((_, i) => {
            return { gitlab_id: i + 1 }
        })

        before('Populate the database with users', function () {
            const ps = [];
            initialTeams.forEach((team) => {
                ps.push(db.query("team").insert({ gitlab_id: team.gitlab_id }));
            });

            return Promise.all(ps)
        })

        it("Should complete small tournament", function (done) {
            this.timeout(10000)
            setTimeout(mockWorkers(), 10)
            main()
                .then((tourney: single) => {
                    tourney.once("on_finished", () => {
                        done()
                    })
                })
                .catch(err => {
                    chai.expect(err).to.not.exist
                });
        })

        after("Clean database", () => {
            db.query.select().from("team_game").delete();
            db.query.select().from("game").delete();
            db.query.select().from("team").delete();
        })
    })
}
