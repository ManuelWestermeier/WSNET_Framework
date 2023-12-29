import { Socket } from "./lib/index.js"
const log = console.log;
var API = new Socket({ url: "ws://localhost:8888" })

API.onOpen = async () => {

    log(await API.get("index", { content: "Hallo" }))

    API.say("hallowelt", {
        HalloWelt: true,
    })

}

API.onGet("location", async res => {
    return document.location.toString()
})

API.onSay("hello", res => {
    log(res)
})