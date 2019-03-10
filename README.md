# ZSockets

ZSockets is a fully standalone socket library built on top of the net standard library from node.


## How to use
ZSockets is fairly simple to use, here are few examples on the way to use it :
### Server example
Sample code:

```js
const Socket = require("../socket");
const port = 500;

const Server = new Socket.Server(port, () => { //Creates the server
    console.log("Server listening on port", port); //Callback when server is running
});

Server.OnInternal("connection", (c) => { //Triggered when a client connects
    console.log("New client connected:", c.ip);

    setTimeout(() => {
	c.Emit("testevent", {}); //Trigger an event on this specific client
    }, 500);

    c.On("testbackclient", () => { //Event triggered from this client to the server
	console.log("Back from specific client");
    });
});

setInterval(() => {
   Server.EmitToAll("testall", {}); //Event triggered on all clients
}, 1000);
```
### Client example
Sample code:

```js
const Socket = require("../socket");
const Client = new Socket.Client("127.0.0.1", 500); //Connecting to the server

Client.On("testevent", () => { //Event triggered from server
    console.log("It works UwU");

    Client.Emit("testbackclient", {}) //Trigger event on server
});

//Event triggered from server (in this case the server is triggering on all clients)
Client.On("testall", () => {
    console.log("All clients yay !");
});
```
