// #############################################################################
// WebSocket
// (kudos: https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61)
// #############################################################################

var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
  // process HTTP request. Since we're writing just WebSockets
  // server we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // process WebSocket message
    }
  });

  connection.on('close', function(connection) {
    // close user connection
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
	console.log('Button ' + ev.button + ' on controller ' + ev.controller + ' pressed');
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
