const { log } = require("console");
const { CreateApi } = require("./lib");

var index = 0;

CreateApi({ port: 8888 }, async client => {

    index++;

    client.onGet("index", res => {

        return {
            index,
        }

    })

    client.onGet("test", res => {

        return {
            content: "Hallo Test"
        }

    });

    client.onSay("test_say", log)

    log(await client.get("x", { index }))

})