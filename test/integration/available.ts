import * as chai from 'chai';
const _ = require('lodash');
import * as db from "../../src/dbUtil";

export default function () {
    describe('Database Connection', () => {

        it('should connect to the database', function () {
            // keep retrying b/c db needs time to come up
            this.retries(5);
            return new Promise((resolve, reject) => {
                db.query.raw('SELECT 1+1')
                    .then(resolve)
            })
        })

    })
}
