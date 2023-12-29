var chars = "qwertzuioplkjhgfdsyxcvbnmMNBVCXYLKDSAPOIUZTREWQ12367890"

export class Socket {

    constructor({ url }) {

        var obj = {
            on: {},
            onGet: {},
            onStream: {},
            promises: {},
        }

        var ws = new WebSocket(url)

        ws.onmessage = async e => {

            var data = JSON.parse(e.data);

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

        }

        this.send = (res) => {
            ws.send(JSON.stringify(res))
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

        ws.onopen = () => { this.onOpen() };
        ws.onerror = e => { this.onError(e) };
        ws.onclose = e => { this.onClose(e) };

    }

    onOpen() { }
    onError() { }
    onClose() { }

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


export function createInfinitySocket({ url }, callback) {

    function start() {
        var socket = new Socket({ url });
        socket.onOpen = x => { callback(socket) };
        socket.onClose = () => { start() };
        socket.onError = () => { start() };
    }

    start();

}

export var utils = {
    getID,
    isPromise: thing => thing instanceof Promise,
}