
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
## Documentation
### Server

#### new Socket.Server(port[, callback])
  - `port` _(int)_ The port on which the clients will connect to the server.
  - `callback` _(function)_
#### Server.OnInternal(event[, callback])
- `event` _(string)_ The internal event name to listen to
	- `"connection"`: Triggered when a new client connects
		- Returns client _(Object)_
	- `"disconnected"`: Triggered when a client disconnects
		- Returns client _(Object)_
	- `"error"`: Triggered when the server occurs an error
		- Returns error _(Object)_
	- `"cerror"`: Triggered when one of the clients occurs an error
		- Returns error _(Object)_
	
- `callback` _(function)_
#### Server.EmitToAll(event[, object])
- `event` _(string)_ Event name to trigger on all clients connected
- `object` _(Object)_

### Client object (server side)

#### Client.On(event[, callback])
- `event` _(string)_ The server event name to listen for client trigger
- `callback` _(function)_
#### Client.Emit(event[, object])
- `event` _(string)_ Event name to trigger on client
- `object` _(Object)_
