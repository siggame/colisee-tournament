import * as db from "../../src/dbUtil";
import * as chai from "chai";

export default function () {

  describe("| Database", () => {

    const initialTeams = Array(3).fill(null).map((_, i) => {
      return { gitlab_id: i + 1 }
    })

    before("Populate the database with users", function () {
      return Promise.all(initialTeams.map((team) =>
        db.query("team").insert({ gitlab_id: team.gitlab_id })
          .then(_ => { })
      ))
    })

    it("should be able to create a game", function () {
      return db.getTeams().then((teams: any[]) => {
        const ids = teams.slice(0, 2).map(team => team.id)
        return db.createGame(ids)
          .then(game => {
            chai.expect(game).to.exist;
            chai.expect(game).has.property("id");
          })
      })
    })

    it("should be able to get a finished game", function () {
      return db.getTeams().then((teams: any[]) => {
        const ids = teams.slice(0, 2).map(team => team.id)
        return db.createGame(ids).then(game =>
          db.query("game")
            .where({ id: game.id })
            .update({ status: "finished" })
            .then(_ =>
              db.query("team_game")
                .where({ game_id: game.id })
                .then(team_games => {
                  let winner = Math.floor(Math.random() * 2) % 2;
                  return Promise.all(team_games.map(team_game => {
                    winner ^= 1;
                    return db.query("team_game")
                      .where({ team_id: team_game.team_id, game_id: game.id })
                      .update({ winner: Boolean(winner ^ 1) })
                      .then(_ => { })
                  }))
                }))
            .then(_ =>
              db.getFinishedGameResult(game.id)
                .then(result => {
                  chai.expect(result).to.exist;
                  chai.expect(result).has.property("winner");
                })))
      })
    })

    after("Clean up database", function () {
      return db.query("team_game").del().then(_ =>
        Promise.all([
          db.query("game").del(),
          db.query("team").del()
        ]))
    })
  });
}
