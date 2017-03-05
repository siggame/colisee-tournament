import * as chai from "chai";
import * as db from "../../src/dbUtil";

export default function () {
  describe("| Connection", () => {

    it("should connect to the database", function () {
      this.retries(5);
      return new Promise((resolve, reject) => {
        db.query.raw("SELECT 1+1")
          .then(resolve)
      })
    })

  })
}
