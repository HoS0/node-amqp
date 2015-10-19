'use strict';

var
  amqp = require('./amqp'),
  EventEmitter = require('events').EventEmitter;

var Wrapper = new EventEmitter();

Wrapper.initialize = function(serviceName, config) {
  var self = this;
  config = config || {};
  /* Override config */
  process.env.RABBIT_URL = config.host || process.env.RABBIT_URL;
  process.env.RABBIT_PORT = config.port || process.env.RABBIT_PORT;
  process.env.RABBIT_USERNAME = config.username || process.env.RABBIT_USERNAME;
  process.env.RABBIT_PASSWORD = config.password || process.env.RABBIT_PASSWORD;
  process.env.RABBIT_TIMEOUT = config.timeout || process.env.RABBIT_TIMEOUT;
  process.env.RABBIT_AUTH_MECHANISM = config.auth_mechanism || process.env.RABBIT_AUTH_MECHANISM;

  amqp.Initialize(serviceName, function() {
    self.emit('ready', {});
  });
};

Wrapper.createQueue = function(name, handler) {
  var self = this;
  amqp.CreateRequestQueue(name, function(message){

    var cb = message.responceNeeded? function(err, response){
      if(err){
        return amqp.SendMessage(message.sender, {
          id: message.id,
          responceNeeded: false,
          error: err,
          payload: {}
        });
      }

      return amqp.SendMessage(message.sender, {
        id: message.id,
        responceNeeded: false,
        payload: response
      });
    } : null;

    handler(message.payload, cb);
  });
};

Wrapper.sendMessage = function(to, message, callback) {
  var msg = {
    responceNeeded: typeof callback === 'function',
    payload: message
  };

  amqp.SendMessage(to, msg, function(response){
    if(response.error){
      return callback(response.error);
    }

    return callback(null, response.payload);
  });
};

Wrapper.getOld = function(){
  return amqp;
};

module.exports = Wrapper;
