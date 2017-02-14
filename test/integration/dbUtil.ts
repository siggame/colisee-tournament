import * as db from "../../src/dbUtil";
import * as chai from "chai";

describe('Database Utility', function () {

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
            .then(game => {
                setTimeout(() => db.query('game')
                    .where({ id: game.id })
                    .update({ status: "finished" }), 500);
                return db.getFinishedGame(game.id);
            })
            .then(game => {
                chai.expect(game).to.exist;
                chai.expect(game).has.property('id');
            })
    })

});
