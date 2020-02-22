$(function () {
    "use strict";

    var page = $('#body');
    var lock = false;
    let mirrored = new URLSearchParams(window.location.search).has('mirrored');
    let muted = new URLSearchParams(window.location.search).has('muted');

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        console.warn("Sorry, but your browser doesn\'t support WebSockets.");
        return;
    }

    // open connection
    var connection = new WebSocket('ws://'+window.location.hostname+':3000');

    connection.onopen = function () {
        console.log("connection opened: " + connection.readyState);
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        console.warn("Sorry, but there\'s some problem with your connection or the server is down. " + error);
    };

    // most important part - incoming messages
    connection.onmessage = function (json) {
      let message = JSON.parse(json.data);
      if (message.type == 'status') {
        console.log("Status message received: %o", message.data);
        return;
      }
      if (message.type == 'buzz-event') {
        console.log("Received buzz-event  %o", message.data);

        if (message.data.button != 0) {
            console.log("Player " + message.data.controller + " pressed the wrong button (was " + message.data.button + ")")
            return;
        }
        if (lock) {
          console.log(message.data.controller + " was too late!");
          return;
        }
        lock = true;
        if (message.data.button !== null) {
          let playerOneDiv = (!mirrored) ? '.left' : '.right'
          let playerTwoDiv = (!mirrored) ? '.right' : '.left'
          var playerOneAudio = (!mirrored) ? '#audio-left' : '#audio-right'
          var playerTwoAudio = (!mirrored) ? '#audio-right' : '#audio-left'
          switch (message.data.controller) {
            case 1:
              $(playerOneDiv).addClass('one-wins');
              if (!muted)$(playerOneAudio)[0].play();
              break;
            case 2:
              $(playerTwoDiv).addClass('two-wins');
              if (!muted)$(playerTwoAudio)[0].play();
              break;
            default:
              console.warn("Controller " + message.data.contoller + " not supported!")
          }
        }
      }
    };
});
