"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

const serverPort = 3000,
    http = require("http"),
    express = require("express"),
    app = express(),
    server = http.createServer(app),
    WebSocket = require("ws"),
    websocketServer = new WebSocket.Server({ server }),
    buzzBuzzers = require('../buzz-buzzers/src/index'),
    buzzers = buzzBuzzers(); // initialize buzzers

//when a websocket connection is established
websocketServer.on('connection', (webSocketClient) => {
    //send feedback to the incoming connection
    webSocketClient.send(JSON.stringify({ type:'status', data: { "connection" : "ok"} }));

    //when a message is received
    webSocketClient.on('message', (message) => {

        //for each websocket client
        websocketServer
          .clients
          .forEach( client => {
              //send the client the current message
              client.send(`{ "message" : ${message} }`);
          });
    });

    // Get notified when a button is pressed
    buzzers.onPress(function(ev) {
      // ev is an object with two attributes:
      // - controller: Number from 1 to 4
      // - button: Number from 0 to 4. 0 is the big red button.
      var msg = 'Button ' + ev.button + ' on controller ' + ev.controller + ' pressed'
      console.log(msg);
      var obj = {
              time: (new Date()).getTime(),
              text: msg,
              button: ev.button,
              controller: ev.controller
          };
      var json = JSON.stringify({ type:'buzz-event', data: obj });
      webSocketClient.send(json);
    });
});

// serve static files in directory `static`
app.use(express.static('static'))
//start the web server
server.listen(serverPort, () => {
    console.log(`Server started on port ` + serverPort);
    identifyBuzzers();
});

// Get notified when a button is released
buzzers.onRelease(function(ev) {
	console.log('Button ' + ev.button + ' on controller ' + ev.controller + ' released');
});

// Get notified whenever something changes
buzzers.onChange(function(state) {
	// state is an array of booleans with all buttons
	// false means the button is not pressed
	// and true when a button is pressed
	/* An example could look like this, in this case the second color button
	of controller 2 was pressed and the big red button on controller four is pressed
	[
        false, false, false, false, false, // first controller
        false, false, true, false, false, // second controller
        false, false, false, false, false, // third controller
        true, false, false, false, false // fourth controller
    ]
	*/
});

// Get notified when an error happens
buzzers.onError(function(err) {
	console.log('Error: ', err);
});

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
  console.log("Touching controller " + controller)
  buzzers.setLeds(controller[0], controller[1], controller[2], controller[3]);
  setTimeout(function() {
      buzzers.setLeds(false, false, false, false);
  }, 500);
}
