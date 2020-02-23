"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

const serverPort = 3000,
    http = require("http"),
    express = require("express"),
    app = express(),
    server = http.createServer(app),
    ip = require('ip'),
    qrcode = require('qrcode-terminal'),
    WebSocket = require("ws"),
    websocketServer = new WebSocket.Server({ server }),
    buzzBuzzers = require('../buzz-buzzers/src/index'),
    buzzers = buzzBuzzers() // initialize buzzers
    ;
let roundLocked = false; // first pressed controller wins!

// serve static files in directory `static`
app.use(express.static('static'))
//start the web server
server.listen(serverPort, () => {
    const ownAddress = "http://" + ip.address() + ":" + serverPort
    console.log(`Server started ` + ownAddress);
    qrcode.generate(ownAddress);
    identifyBuzzers();
});

//when a websocket connection is established
websocketServer.on('connection', (webSocketClient) => {
    console.log("new ws-connection established");
    //send feedback to the incoming connection
    webSocketClient.send(JSON.stringify({ type:'status', data: { "connection" : "ok"} }));

    //when a message is received
    webSocketClient.on('message', (message) => {
        let json = JSON.parse(message)
        console.log("Received a web-socket-message: %o", json);
        if (json.type == 'status') {
          // console.log("Status message received: %o", json.data.action);
          if (json.data.action == 'reset-state') {
            resetState();
          }
          if (json.data.action == 'blink') {
            let ctr = json.data.controller;
            let controllers = [ctr == 1, ctr == 2, ctr == 3, ctr == 4];
            if (json.data.time != 0) {
              blinkBuzzerLeds(controllers);
            } else {
              blinkPanic(controllers);
            }
          }
        }

        // notify each websocket client of this message also
        websocketServer
          .clients
          .forEach( client => {
              //send the client the current message
              client.send(message);
          });
    });

    // Get notified when a button is pressed
    buzzers.onPress(function(ev) {
      // ev is an object with two attributes:
      // - controller: Number from 1 to 4
      // - button: Number from 0 to 4. 0 is the big red button.
      var msg = 'Button ' + ev.button + ' on controller ' + ev.controller + ' pressed'
      console.log(msg);

      if (ev.button != 0) return; // only button 0 is valid
      if (roundLocked) return; // we already have a winner

      // now we have a winner of this round
      // we decide this here in server and not in the UI b/c we use websocket-connection
      // to mutliple clients. so it is theoretically possible that two controller signals
      // will reach the clients.
      roundLocked = true;
      var obj = {
              time: (new Date()).getTime(),
              text: msg,
              button: ev.button,
              controller: ev.controller
          };
      var json = JSON.stringify({ type:'buzz-event', data: obj });
      //for each websocket client
      websocketServer
        .clients
        .forEach( client => {
            //send the client the current message
            client.send(json);
        });
    });
});

// Get notified when a button is released
buzzers.onRelease(function(ev) {
  // console.log('Button ' + ev.button + ' on controller ' + ev.controller + ' released');
});

// Get notified when an error happens
buzzers.onError(function(err) {
	console.log('Error: ', err);
});

// this lets blink one controller after each other
function identifyBuzzers() {
  var controller = [true, false, false, false]
  var round = 0;
  var interval = setInterval(function() {
      blinkBuzzerLeds(controller);
      round++;
      controller.forEach((item, i) => {
        controller[i] = (i == round);
      });

      if (round == 4) {
        // stop
        clearInterval(interval)
      }
  }, 1000);
}


function blinkBuzzerLeds(controller) {
  blinkBuzzerLedsFor(controller, 500);
}

function blinkBuzzerLedsFor(controller, millis) {
  console.log("Touching controller " + controller)
  buzzers.setLeds(controller[0], controller[1], controller[2], controller[3]);
  setTimeout(function() {
      buzzers.setLeds(false, false, false, false);
  }, millis);
}

function blinkPanic(controller) {
  console.log("Panic for controller " + controller);
  let round = 0;
  let panicInterval = setInterval(function() {
      blinkBuzzerLedsFor(controller, 100);
      round++;
      if (round == 15) {
        // stop
        console.log("stop panic after " + round + " rounds.")
        clearInterval(panicInterval);
      }
  }, 200);
}

function resetState() {
  roundLocked = false;
  console.log("resetted state.")
}
