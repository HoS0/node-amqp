var amqp = require('../amqp');

var name = 'product';

amqp.Initialize(name);

amqp.CreateRequestQueue(name, function(message) {
    console.log(message);

    if (message.sender) {
        message.responceNeeded = false;
        amqp.SendMessage(message.sender, message);
    }
});
