const { log } = require("console");
const { CreateApi } = require("./lib");

var index = 0;

CreateApi({ port: 8888 }, async client => {

    console.clear()
    index++;

    client.onGet("index", res => {
        log(res)
        return index
    })

    client.onSay("hallowelt", res => {
        log(res)
    })

    client.say("hello", {})

    var location = await client.get("location", { x: true })
    log(location)

})