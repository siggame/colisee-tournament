import * as chai from "chai";
import * as db from "../../src/dbUtil";
import { App } from "../../src/app";
const _ = require("lodash");

export default function () {
  describe("| App", () => {

    const initialTeams = Array(3).fill(null).map((_, i) => {
      return { gitlab_id: i + 1 }
    })

    before("Populate the database with users", function () {
      return Promise.all(initialTeams.map((team) =>
        db.query("team").insert({ gitlab_id: team.gitlab_id })
          .then(_ => { })
      ))
    })

    it("should be able to prepare tournament", function () {
      const app = new App();

      return app.prepareTournament()
        .then(tourney => chai.expect(tourney).to.exist)
    })

    it("should be able to poll for updated game", () => {
      const app = new App();

      function updateTeamGames(team_games) {
        return Promise.all(team_games.map((team_game, i) =>
          db.query("team_game").where({
            team_id: team_game.team_id,
            game_id: team_game.game_id
          }).update({
            winner: Boolean(i % 2 == 0)
          }).then(_ => { })
        ))
      }

      return db.getTeams().then((teams: any[]) => {
        const ids = teams.slice(0, 2).map(team => team.id)
        return db.createGame(ids).then(game => {
          // mock results
          setTimeout(_ =>
            db.query("team_game")
              .where({ game_id: game.id })
              .then((team_games: any[]) => {
                updateTeamGames(team_games)
              }),
            250);
          // mock game over
          setTimeout(_ =>
            db.query("game")
              .where({ id: game.id })
              .update({ status: "finished" })
              .then(_ => { }),
            500);
          return game.id;
        }).then(game_id =>
          app.poll(game_id)
            .then(result => {
              chai.expect(result).to.exist;
              chai.expect(result).to.have.property("winner");
              chai.expect(result).to.have.property("loser");
            }))
      })
    });

    after("Clean up database", function () {
      return db.query("team_game").del().then(_ =>
        Promise.all([
          db.query("game").del().then(_ => { }),
          db.query("team").del().then(_ => { })
        ]))
    })
  })
}
