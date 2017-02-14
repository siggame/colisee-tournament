import * as chai from 'chai';
const _ = require('lodash');
import * as db from "../src/dbUtil";

describe('Database Connection', function(){

    it('should connect to the database', function(done){
        // keep retrying b/c db needs time to come up
        this.retries(5);
        db.query.raw('SELECT 1+1')
            .then(()=>done())
            .catch(err=>chai.expect(err).to.not.exist)
    });

});