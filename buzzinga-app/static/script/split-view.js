$(function () {
    "use strict";

    var page = $('#body');
    var lock = false;
    let mirrored = new URLSearchParams(window.location.search).has('mirrored');
    let muted = new URLSearchParams(window.location.search).has('muted');
    let playerOneDiv = (!mirrored) ? '.left' : '.right'
    let playerTwoDiv = (!mirrored) ? '.right' : '.left'
    let playerOneAudio = (!mirrored) ? '#audio-left' : '#audio-right'
    let playerTwoAudio = (!mirrored) ? '#audio-right' : '#audio-left'
    let countdownDelay, countdownInterval;

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
        if (message.data.action == 'reset-state') {
          reset();
        }
        return;
      }
      if (message.type == 'buzz-event') {
        console.log("Received buzz-event  %o", message.data);

        if (message.data.button != 0) {
            console.log("Player " + message.data.controller + " pressed the wrong button (was " + message.data.button + ")")
            return;
        }
        if (lock) {
          // not necessary anymore - this logic is now hosted in the server
          console.log(message.data.controller + " was too late!");
          return;
        }
        lock = true;
        if (message.data.button !== null) {

          switch (message.data.controller) {
            case 1:
              $(playerOneDiv).addClass('one-wins');
              countdown(message.data.controller, $(playerOneDiv).find('.centered h2'), $(playerOneAudio)[0]);
              break;
            case 2:
              $(playerTwoDiv).addClass('two-wins');
              countdown(message.data.controller, $(playerTwoDiv).find('.centered h2'), $(playerTwoAudio)[0]);
              break;
            default:
              console.warn("Controller " + message.data.contoller + " not supported!")
          }
        }
      }
    };

    page.keypress(function(event) {
      if (event.which == 32) {
        event.preventDefault();
        connection.send(JSON.stringify({type: 'status', data: { 'action' : 'reset-state' }}))
      }
    });

    function countdown(controller, buzzView, buzzAudio) {
      // start a countdown on the UI
      countdownDelay = setTimeout(function() {
        let seconds = 5;
        countdownInterval = setInterval(function() {
          connection.send(JSON.stringify({
            type: 'status',
            data: {
              action : 'blink',
              controller: controller,
              time: seconds
            }}));
          buzzView.text(seconds);
          if (seconds == 0) {
            if (!muted) $('#time-out')[0].play();
            clearInterval(countdownInterval);
          } else {
            if (!muted) $('#second-beep')[0].play();
          }
          seconds--;
        }, 1000)
      }, 700);

      if (muted) return;
      buzzAudio.play();
    }

    function reset() {
      lock = false;
      $(playerOneDiv).removeClass('one-wins');
      $(playerTwoDiv).removeClass('two-wins');
      $(playerOneDiv).find('.centered h2').text('');
      $(playerTwoDiv).find('.centered h2').text('');
      stopAudio($(playerOneAudio)[0]);
      stopAudio($(playerTwoAudio)[0]);
      clearTimeout(countdownDelay);
      clearInterval(countdownInterval);
      stopAudio($('#second-beep')[0]);
      stopAudio($('#time-out')[0]);
    }

    function stopAudio(audio) {
      audio.pause();
      audio.currentTime = 0;
    }
});
