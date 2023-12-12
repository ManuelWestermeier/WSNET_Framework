import { Socket } from "./lib/index.js"
const log = console.log;
var API = new Socket({ url: "ws://localhost:8888" })

API.onOpen = async () => {

    var { index } = await API.get("index", { content: "Hallo" })

    log("get : index : " + index)

    API.say("hallowelt", {
        HalloWelt: true
    })

}

API.onGet("location", res => {
    log("onGet : location :")
    log(res)
    return { url: document.location.toString() }
})

API.onSay("hello", res => {
    log("onSay : hallo : ")
    log(res)
})