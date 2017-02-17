import * as knexModule from "knex";
const _ = require('lodash');

export const query = knexModule({
  client: 'pg',
  connection: {
    host: _.defaultTo(process.env.POSTGRES_HOST, "localhost"),
    port: _.defaultTo(process.env.POSTGRES_PORT, 5432),
    user: _.defaultTo(process.env.POSTGRES_USER, "postgres"),
    password: _.defaultTo(process.env.POSTGRES_PASSWORD, "postgres"),
    database: _.defaultTo(process.env.POSTGRES_DB, "postgres")
  },
  debug: _.defaultTo(process.env.POSTGRES_DEBUG, false)
});

export function getTeams() {
  return new Promise((resolve, reject) => {
    query('team')
      .then(resolve)
      .catch(reject);
  });
}

export function createGame(team_ids: any[]): Promise<any> {
  if (team_ids.length < 2) throw new Error("Not enough gitlab ids.")
  return new Promise((resolve, reject) => {
    query("game").insert({}, '*')
      .then(rows => rows[0])
      .then(game => {
        // Promises to insert team_game
        return query("team").where("id", "in", team_ids)
          .then(teams => {
            if (teams.length < 2) {
              console.log(game, teams, team_ids)
              throw new Error("Not enough teams.")
            }
            return Promise.all(teams.map(team =>
              query("team_game").insert({ team_id: team.id, game_id: game.id })))
              .then(_ => game)
          })
      })
      .then(resolve)
      .catch(reject)
  })
}

export function getFinishedGameResult(id: number): Promise<any> {
  return new Promise((resolve, reject) => {
    query("game").where({
      id: id,
      status: "finished"
    }).then(games => {
      if (games.length === 0) return null;
      return query('team_game')
        .where({ game_id: id })
        .then(team_games => {
          if (team_games.length < 2) return null;

          const unfinished_game = team_games.reduce((accum, team_game) =>
            accum || team_game.winner === null
            , false)

          if (unfinished_game) return null;

          return team_games.reduce((accum, team_game) => {
            if (team_game.winner) {
              accum["winner"] = team_game.team_id;
            }
            else {
              accum["loser"] = team_game.team_id;
            }
            return accum;
          }, {});
        })
    })
      .then(resolve)
      .catch(reject);
  })
}
