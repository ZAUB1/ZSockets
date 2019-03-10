const net = require("net")

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
        }
    }

    On(n, cb)
    {
        if (this.events[n])
            this.events[n][this.events[n].length] = cb;
        else
            this.events[n] = [];
            this.events[n][this.events[n].length] = cb;
    }
}

class Client {
    constructor(ip, port)
    {
        this.events = [];

        this.client = new net.Socket();

        this.client.connect(port, ip);

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
        }
    }

    On(n, cb)
    {
        if (this.events[n])
            this.events[n][this.events[n].length] = cb;
        else
            this.events[n] = [];
            this.events[n][this.events[n].length] = cb;
    }

    Emit(n, obj)
    {
        this.client.write(JSON.stringify({n: n, obj: obj}), "utf-8");
    }
};

module.exports = {
    Server: Server,
    Client: Client
};