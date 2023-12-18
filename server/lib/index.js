const { WebSocketServer } = require("ws");
var chars = "qwertzuioplkjhgfdsyxcvbnmMNBVCXYLKDSAPOIUZTREWQ12367890"

class Client {

    constructor(socket) {

        var obj = {
            on: {},
            Get: {},
            promises: {}
        }

        socket.onmessage = e => {

            var data = JSON.parse(e.data.toString())

            if (data?.method?.toLocaleUpperCase() == "GET") {
                if (obj.Get?.[data?.key])
                    this.send({
                        ...obj.Get[data?.key](data),
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
                obj.promises[data?.id](data)
            else if (data?.method?.toLocaleUpperCase() == "SAY") {
                if (obj.on[data?.key])
                    obj.on[data?.key]?.(data)
            }
            else {
                if (obj.on?.[data?.key])
                    obj.on[data?.key](data)
            }

        }

        this.onSay = (key, callback) => {
            obj.on[key] = callback
        }

        this.onGet = (key, callback) => {
            obj.Get[key] = callback;
        }

        this.get = (key, res) => {

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

                obj.promises[id] = res => {

                    delete obj.promises[id]

                    clearTimeout(dont)

                    reslove(res)

                }

            })

        }

        this.say = (key, res) => {
            this.send({
                ...res,
                key,
                method: "SAY"
            })
        }

        this.send = (res) => {
            socket.send(JSON.stringify(res))
        }

        socket.onclose = x => { this.onClose(x) };
        socket.onerror = x => { this.onError(x) };
        socket.onopen = x => { this.onOpen(x) };

    }

    onOpen() { }
    onClose() { }
    onError() { }

}

function CreateApi({ port }, callback) {

    new WebSocketServer({ port }).on("connection", socket => {

        callback(new Client(socket));

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
exports.utils = {
    getID
};

process.on("uncaughtException", err => { console.error(err) })