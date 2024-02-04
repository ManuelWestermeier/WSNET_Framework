# MWTCP-

The Next Gen of http

# Basic setup

## Client

``` js
import Client from "./_client";

var API = new Client("ws://localhsot:211")

API.onopen = async () => {

    API.say("hello", "__DATA__")

}
```

## Server

``` js
const { createServer } = require("./_server");

createServer({ port: 211 }, async client => {

    client.onSay("hello", data => console.log(data))

})
```


## Methods 
### 1. Get / onGet
#### can handle only one handler per key
### 2. Say / onSay
#### can handle unlimited handler per key