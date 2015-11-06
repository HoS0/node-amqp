var amqp = require('./../wrapper');

amqp.initialize('consumer');

amqp.on('ready', function(){
  amqp.createQueue('echo', function(msg, cb){
    if(cb){
      cb(null, msg);
    }
  });
});
