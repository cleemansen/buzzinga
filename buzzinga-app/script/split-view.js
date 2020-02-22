$(function () {
    "use strict";

    var page = $('#body');
    var lock = false;
    var buzzOneAudio = document.getElementById("audio-left");
    var buzzTwoAudio = document.getElementById("audio-right");

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        console.warn("Sorry, but your browser doesn\'t support WebSockets.");
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        console.log("connection opened: " + connection.readyState);
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        console.warn("Sorry, but there\'s some problem with your connection or the server is down.");
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        console.log("Received " + JSON.stringify(json));

        if (json.data.button != 0) {
            console.log("Player " + json.data.controller + " pressed the wrong button (was " + json.data.button + ")")
            return;
        }
        if (lock) {
          console.log(json.data.controller + " was too late!");
          return;
        }
        lock = true;
        if (json.data.button !== null) {
          switch (json.data.controller) {
            case 1:
              $('.one').addClass('one-wins');
              buzzOneAudio.play();
              break;
            case 2:
              $('.two').addClass('two-wins');
              buzzTwoAudio.play();
              break;
            default:
              console.warn("Controller " + json.data.contoller + " not supported!")
          }
        }
    };
});
