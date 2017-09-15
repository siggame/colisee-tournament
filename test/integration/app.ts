import { expect } from "chai";

import { app } from "../../src";

export default () => {

    describe("App", function () {
        it("should not be null", (done) => {
            expect(app).to.not.be.null;
            done();
        });
    });

};
