const http = require('http');
var buzzBuzzers = require('../buzz-buzzers/src/index')
var buzzers = buzzBuzzers(); // initialize buzzers

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);

    console.log(`buzz-buzzers initialized`)
});



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
