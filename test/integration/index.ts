import app from "./app"
import available from "./available"
import dbUtil from "./dbUtil"
import main from "./main"

export default function () {
    describe("Integration Tests", function () {
        available()
        app()
        dbUtil()
        main()
    })
}
