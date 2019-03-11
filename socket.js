const net = require("net");

class Server {
    constructor(port, cb)
    {
        this.events = [];

        //Usual events
        this.events["connection"] = [];
        this.events["error"] = [];
        this.events["disconnected"] = [];
        this.events["cerror"] = [];

        this.clients = [];

        //Creating the server
        this.server = net.createServer((c) => {
            c.id = Math.floor(Math.random() * 1000);
            this.clients[c.id] = new ServerClient(c);

            this.InternalEvent("connection", this.clients[c.id]);
        });

        this.server.listen(port);

        this.server.on("error", (err) => {
            this.InternalEvent("error", err);
        });

        this.OnInternal("connection", (c) => {
            c.c.on("end", () => {
                this.InternalEvent("disconnected", this.clients[c.id]);

                this.clients.splice(c.id, 1);
            });

            c.c.on("error", (err) => {
                if (err.message.includes('ECONNRESET')) //Error which happends when the client exists randomly so yeah we handle it as disconnection
                    this.InternalEvent("disconnected", this.clients[c.id]);
                else
                    this.InternalEvent("cerror", err);
            });

            c.c.on("data", (data) => {
                const decode = JSON.parse(data);

                c.Internal(decode.n, decode.obj)
            });
        });

        if (cb)
            cb();
    }

    InternalEvent(n, ...args)
    {
        if (this.events[n])
        {
            for (let i = 0; i < this.events[n].length; i++)
                if (this.events[n][i])
                    this.events[n][i](...args);
                else
                    return;
        }
    }

    OnInternal(n, cb)
    {
        if (this.events[n])
        {
            this.events[n][this.events[n].length] = cb;
        }
        else
        {
            this.events[n] = [];
            this.events[n][this.events[n].length] = cb;
        }
    }

    EmitToAll(n, obj)
    {
        this.clients.forEach((e) => {
            e.Emit(n, obj);
        });
    }
};

class ServerClient {
    constructor(c)
    {
        this.c = c;
        this.ip = c.remoteAddress;
        this.id = c.id;

        this.events = [];
    }

    Emit(n, obj)
    {
        this.c.write(JSON.stringify({n: n, obj: obj}), "utf-8");
    }

    Internal(n, obj)
    {
        if (this.events[n])
        {
            for (let i = 0; i < this.events[n].length; i++)
                if (this.events[n][i])
                    this.events[n][i](obj);
                else
                    return;
        }
    }

    On(n, cb)
    {
        if (this.events[n])
        {
            this.events[n][this.events[n].length] = cb;
        }
        else
        {
            this.events[n] = [];
            this.events[n][this.events[n].length] = cb;
        }
    }
}

class Client {
    constructor(ip, port)
    {
        this.events = [];

        this.events["connect"] = [];
        this.events["disconnect"] = [];

        this.client = new net.Socket();

        this.client.connect(port, ip);

        this.client.on("connect", () => {
            this.Event("connect", {});
        });

        this.client.on("end", () => {
            this.Event("disconnect", {});
        })

        this.client.on("data", (data) => {
            const dec = JSON.parse(data);

            this.Event(dec.n, dec.obj);
        });
    }

    Event(n, obj)
    {
        if (this.events[n])
        {
            for (let i = 0; i < this.events[n].length; i++)
                if (this.events[n][i])
                    this.events[n][i](obj);
                else
                    return;
        }
    }

    On(n, cb)
    {
        if (this.events[n])
        {
            this.events[n][this.events[n].length] = cb;
        }
        else
        {
            this.events[n] = [];
            this.events[n][this.events[n].length] = cb;
        }
    }

    Emit(n, obj)
    {
        this.client.write(JSON.stringify({n: n, obj: obj}), "utf-8");
    }
};

class WebSocketServer {
    constructor(port, cb)
    {
        this.events = [];

        this.events["connection"] = [];
        this.events["error"] = [];
        this.events["disconnected"] = [];

        const http = require('http');

        const wserver = http.createServer((req, res) => {
            req.addListener('end', () => {console.log("ERRR")});
        });

        wserver.listen(port);

        wserver.on("upgrade", (req, socket) => {
            if (req.headers['upgrade'] !== 'websocket')
            {
                socket.end('HTTP/1.1 400 Bad Request');
                return;
            }
        });

        wserver.on("connection", (c) => {
            c.on("end", () => {
            })

            c.on('data', chunk => {
                let bdata = chunk.toString();
                let lastw = "";
                let wtforevent = false;

                for (let i = 0; i < bdata.length; i++)
                {
                    if (bdata[i] != " ")
                    {
                        if (bdata[i] != "/")
                            lastw += bdata[i];
                    }
                    else
                    {
                        if (lastw == "GET")
                            wtforevent = true;
                        else if (wtforevent)
                        {
                            const res = JSON.parse(decodeURIComponent(lastw));
                            this.Event(res.n, res.obj);

                            return;
                        }

                        lastw = "";
                    }
                }
            });
        });

        if (cb)
            cb();
    }

    On(n, cb)
    {
        
    }

    Event(n, obj)
    {
        console.log(n)
    }
}

module.exports = {
    Server: Server,
    Client: Client,
    WebSocketServer: WebSocketServer
}; 