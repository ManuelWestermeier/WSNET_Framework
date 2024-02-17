# MWTCP-

The Next Gen of http

# Basic setup

## Client

```js
import Client from "WSNET_Framework/_client/index.js";

//create the conection
//websocket host | params
const API = new Client("ws:localhost:8080", { user: "xxx" });
//set listener for the echo request
API.onGet("get", (data) => {
  return data * 2;
});
//set listener for the say message
API.onSay("echo", (data) => {
  console.log(data);
});
//onopen
API.onopen = async () => {
  //post the echo command to the server
  API.say("echo", "echo 1");
  //log & get the value
  console.log(await API.get("get", 10));
};
```

## Server

```js
import { log } from "console";
import { createServer } from "WSNET_Framework/_server/index.js";
const port = 8080;

//create the server on port 8080
createServer({ port }, async (client) => {
  //get the params
  client.onParams((data) => log(data));
  //on request the echo key
  client.onGet("echo", async (data) => {
    //get resource from client
    return await client.get("echo", data);
  });
  //listen for posts and resent them
  client.onSay("echo", (data) => {
    client.say("echo", data);
  });
});
```

## Methods

### 1. Get / onGet

#### can handle only one handler per key

### 2. Say / onSay

#### can handle unlimited handler per key

### 3. Params

#### only one time