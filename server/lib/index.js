const { WebSocketServer } = require("ws");
var chars = "qwertzuioplkjhgfdsyxcvbnmMNBVCXYLKDSAPOIUZTREWQ12367890"

class Client {

    constructor(socket) {

        var obj = {
            on: {},
            onGet: {},
            promises: {}
        }

        socket.onmessage = async e => {

            var data = JSON.parse(e.data.toString())

            if (data?.method?.toLocaleUpperCase() == "GET") {
                if (obj.onGet?.[data?.key]) {
                    var res = obj.onGet[data?.key](data.cont)
                    if (isPromise(res))
                        res.then(_res => {
                            this.send({
                                cont: _res,
                                method: "GETBACK",
                                id: data?.id,
                            })
                        })
                    else this.send({
                        cont: res,
                        method: "GETBACK",
                        id: data?.id,
                    })
                }
                else this.send({
                    method: "GETBACK",
                    id: data?.id,
                    cont: "404",
                })
            }
            else if (data?.method?.toLocaleUpperCase() == "GETBACK")
                obj.promises[data?.id](data.cont)
            else if (data?.method?.toLocaleUpperCase() == "SAY") {
                if (obj.on[data?.key])
                    obj.on[data?.key]?.(data.cont)
            }
            else {
                if (obj.on?.[data?.key])
                    obj.on[data?.key](data.cont)
            }

        }

        this.onSay = (key, callback) => {
            obj.on[key] = callback
        }

        this.onGet = (key, callback) => {
            obj.onGet[key] = callback;
        }

        this.get = (key, res) => {

            var id = getID(6);

            return new Promise((reslove, reject) => {

                this.send({
                    cont: res,
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
                cont: res,
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


const isPromise = obj =>
    obj instanceof Promise;


exports.CreateApi = CreateApi;
exports.utils = {
    getID,
    isPromise
}

process.on("uncaughtException", err => { console.error(err) })