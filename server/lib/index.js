const { WebSocketServer } = require("ws");
var chars = "qwertzuioplkjhgfdsyxcvbnmMNBVCXYLKDSAPOIUZTREWQ12367890"

class Client {

    constructor(socket) {

        this.obj = {
            on: {},
            Get: {},
            promises: {}
        }

        socket.onmessage = e => {

            var data = JSON.parse(e.data.toString())

            if (data?.method?.toLocaleUpperCase() == "GET") {
                if (this.obj.Get?.[data?.key])
                    this.send({
                        ...this.obj.Get[data?.key](data),
                        method: "GETBACK",
                        id: data?.id,
                    })
                else this.send({
                    method: "GETBACK",
                    id: data?.id,
                    content: "404",
                })
            }
            else if (data?.method?.toLocaleUpperCase() == "GETBACK")
                this.obj.promises[data?.id](data)
            else if (data?.method?.toLocaleUpperCase() == "SAY") {
                if (this.obj.on[data?.key])
                    this.obj.on[data?.key]?.(data)
            }
            else {
                if (this.obj.on?.[data?.key])
                    this.obj.on[data?.key](data)
            }

        }

        this.socket = socket;

        socket.onclose = x => { this.onClose(x) };
        socket.onerror = x => { this.onError(x) };
        socket.onopen = x => { this.onOpen(x) };

    }

    onSay(key, callback) {
        this.obj.on[key] = callback
    }

    onGet(key, callback) {
        this.obj.Get[key] = callback;
    }

    get(key, res) {

        var id = getID(6);

        return new Promise((reslove, reject) => {

            this.send({
                ...res,
                method: "GET",
                key,
                id
            })

            var dont = setTimeout(() => {
                reject("more than 3 min")
            }, 1000 * 60 * 3)

            this.obj.promises[id] = res => {

                delete this.obj.promises[id]

                clearTimeout(dont)

                reslove(res)

            }

        })

    }

    say(key, res) {
        this.send({
            ...res,
            key,
            method: "SAY"
        })
    }

    send(res) {
        this.socket.send(JSON.stringify(res))
    }

    onOpen() { }
    onClose() { }
    onError() { }

}

function CreateApi({ port }, callback) {

    new WebSocketServer({ port }).on("connection", socket => {

        var ApiSocket = new Client(socket)

        callback(ApiSocket);

    })

}

function getID(l) {
    var str = ""
    for (let index = 0; index < l; index++) {
        str += chars[Math.floor(Math.random() * chars.length)]
    }
    return str;
}

exports.CreateApi = CreateApi;

process.on("uncaughtException", err => { console.error(err) })