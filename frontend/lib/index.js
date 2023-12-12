var chars = "qwertzuioplkjhgfdsyxcvbnmMNBVCXYLKDSAPOIUZTREWQ12367890"

export class Socket {

    constructor({ url }) {

        this.obj = {
            on: {},
            Get: {},
            promises: {}
        }

        this.ws = new WebSocket(url)

        this.ws.onmessage = e => {

            var data = JSON.parse(e.data);

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
                if (this.obj.on?.[data?.method]?.[data?.key])
                    this.obj.on[data?.method][data?.key](data)
            }

        }

        this.ws.onopen = () => { this.onOpen() };
        this.ws.onerror = e => { this.onError(e) };
        this.ws.onclose = e => { this.onClose(e) };

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

        this.ws.send(JSON.stringify(res))

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