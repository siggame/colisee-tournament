import * as chai from 'chai';
import { App } from '../../src/app';

describe('Matchmaker App', function () {

    it('should be constructable', function () {
        const app = new App();
    });

    it("should be able to prepare tournament", (done) => {
        const app = new App();
        app.prepareTournament(false, false)
            .then(_ => done());
    });
});
