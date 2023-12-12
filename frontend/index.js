import { Socket } from "./lib/index.js"
const log = console.log;
var API = new Socket({ url: "ws://localhost:8888" })

API.onOpen = async () => {

    log(await API.get("test", { content: "Hallo" }))
    log(await API.get("index", { content: "Hallo" }))

    API.say("test_say", {
        HalloWelt: true
    })
}

API.onGet("x", res => {

    return { content: "Hallo X" }

})