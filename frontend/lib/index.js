var chars = "qwertzuioplkjhgfdsyxcvbnmMNBVCXYLKDSAPOIUZTREWQ12367890"

export class Socket {

    constructor({ url }) {

        var obj = {
            on: {},
            Get: {},
            promises: {}
        }

        var ws = new WebSocket(url)

        ws.onmessage = e => {

            var data = JSON.parse(e.data);

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
                if (obj.on?.[data?.method]?.[data?.key])
                    obj.on[data?.method][data?.key](data)
            }

        }

        this.send = (res) => {
            ws.send(JSON.stringify(res))
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

export var utils = {
    getID
}