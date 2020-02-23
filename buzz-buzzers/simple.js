console.log("starting simple.js")

var buzzBuzzers = require('buzz-buzzers');
var buzzers = buzzBuzzers(); // initialize buzzers
//
// // const buzzers = buzzBuzzers();
//
// function blinkBuzzerLeds() {
//     setInterval(function() {
//         buzzers.setLeds(true, true, true, true);
//         setTimeout(function() {
//             buzzers.setLeds(false, false, false, false);
//         }, 500);
//     }, 5000);
// }
//
// blinkBuzzerLeds();
//
// buzzers.onError(function(err) {
//     console.log('Error: ', err);
// });
//
// buzzers.onPress(function(ev) {
//     console.log(
//         `PRESSED: { "Controller": ${ev.controller}, "Button": ${ev.button} }`
//     );
// });
