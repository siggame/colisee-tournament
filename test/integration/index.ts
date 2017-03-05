import app from "./app"
import connection from "./connection"
import dbUtil from "./dbUtil"
import main from "./main"

export default function () {
  describe("Integration", function () {
    connection()
    app()
    dbUtil()
    main()
  })
}
