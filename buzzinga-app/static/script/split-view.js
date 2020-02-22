$(function () {
    "use strict";

    var page = $('#body');
    var lock = false;
    var buzzOneAudio = document.getElementById("audio-left");
    var buzzTwoAudio = document.getElementById("audio-right");

    function mirror() {
      let mirrored = new URLSearchParams(window.location.search).has('mirrored');
      console.log("Mirrored? " + mirrored)
      if (! mirrored) return;
    }

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        console.warn("Sorry, but your browser doesn\'t support WebSockets.");
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:3000');

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
          switch (message.data.controller) {
            case 1:
              $('.one').addClass('one-wins');
              buzzOneAudio.play();
              break;
            case 2:
              $('.two').addClass('two-wins');
              buzzTwoAudio.play();
              break;
            default:
              console.warn("Controller " + message.data.contoller + " not supported!")
          }
        }
      }
    };
});
