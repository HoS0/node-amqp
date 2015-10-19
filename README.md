# AMQP BoilerPlate 2.0
## Changes
I have provided simplified API and ready event so the library is easier to use.

## Usage
- Require the module
- Call initialize function with parameter serviceName(required) and config(optional, see below)
- subscribe to 'ready' event
- Create queues/publish messages

## Examples
### Subscribe to a queue

```js
var amqp = require('AMQP-boilerplate');

amqp.initialize('TestService');

amqp.on('ready', function(){
  amqp.createQueue('echo', function(message, callback){
    // Show message contents in console - DEBUG
    console.log(message);

    // Check if callback is a function (wrapper around responseNeeded attribute)
    if(typeof callback === 'function'){
      // Echo the message back to the provider
      callback(null, message);
    }
  });
});
```

### Publish messages

```js
var amqp = require('AMQP-boilerplate');

amqp.initialize('TestService');

amqp.on('ready', function(){
  setInterval(function(){
    amqp.sendMessage('echo', {
      something: 'else'
    }, function(err, response){
      // Check for error
      if(err){
        console.log(err.stack);
      }

      // If no error occured log response
      else {
        console.log('Hear an echo:');
        console.log(response);
      }
    });
  }, 1000);
});
```

## API

### *amqp*.initialize(serviceName, config)
__Parameters:__

- serviceName: String:Required
- config: Object:optional - overrides ENVVAR config
  - host: amqp url - defaults to 'localhost'
  - port: amqp port - defaults to 5672
  - username: amqp username - defaults to 'guest'
  - password: amqp password - defaults to 'guest'
  - timeout: amqp timeout - defaults to 10000
  - auth_mechanism" amqp authentication mechanism

### *amqp*.createQueue(name, handler)
__Parameters:__

- name: String:required - name of the queue
- handler: Function:required - worker
  - @param(msg:object): message:required
  - @param(callback:function): callback:optional (wrapper around responseNeeded)

### *amqp*.sendMessage(to, message, callback)
__Parameters:__

- to: String:required
- message: Object:required
- callback: Function:optional (wrapper around responseNeeded)
