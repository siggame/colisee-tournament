import { expect } from "chai";

export default () => {

    describe("Sanity", function () {
        it("shall be sane", () => {
            expect(true).to.be.true;
            expect(false).to.be.false;
        });
        it("shall not be insane", () => {
            expect(true).to.not.be.false;
            expect(false).to.be.false;
        });
    });

};
