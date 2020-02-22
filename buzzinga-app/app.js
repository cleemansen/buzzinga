// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

/**
 * Global variables
 */
// list of currently connected clients (users)
var clients = [ ];

// for serving files via HTTP
var fs = require('fs')

/**
 * HTTP server
 */
var server = http.createServer(function(req, res) {
  // serve files in this dir. kudos: https://nodejs.org/en/knowledge/HTTP/servers/how-to-serve-static-files/
  fs.readFile(__dirname + req.url, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
    console.log("Served " + __dirname + req.url)
  });
});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
    identifyBuzzers();
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
    // WebSocket server is tied to a HTTP server. WebSocket request is just
    // an enhanced HTTP request. For more info http://tools.ietf.org/html/rfc6455#page-6
    httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    // accept connection - you should check 'request.origin' to make sure that
    // client is connecting from your website
    // (http://en.wikipedia.org/wiki/Same_origin_policy)
    var connection = request.accept(null, request.origin);
    // we need to know client index to remove them on 'close' event
    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.');

    // user sent some message
    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            // log and broadcast the message
            console.log((new Date()) + ' Received Message from: ' + message.utf8Data);
            // broadcast message to all connected clients
            var obj = {
                    time: (new Date()).getTime(),
                    text: message.utf8Data
                };
            var json = JSON.stringify({ type:'message', data: obj });
            for (var i=0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
        }
    });

    // user disconnected
    connection.on('close', function(connection) {
        console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
        // remove user from the list of connected clients
        clients.splice(index, 1);
    });

});

// #############################################################################
// buzz-buzzers
// #############################################################################
var buzzBuzzers = require('../buzz-buzzers/src/index')
var buzzers = buzzBuzzers(); // initialize buzzers

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
  var json = JSON.stringify({ type:'message', data: obj });
  for (var i=0; i < clients.length; i++) {
      clients[i].sendUTF(json);
  }
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
