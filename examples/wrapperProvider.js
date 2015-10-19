'use strict';

var amqp = require('./../wrapper');

amqp.initialize('mock');

amqp.on('ready', function() {

  setInterval(function() {
    amqp.sendMessage('echo', {
      first_name: 'hello',
      last_name: 'dolly'
    }, function(err, response) {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(response);
      }
    });
  }, 200);

});
