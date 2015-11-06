var amqp = require('../amqp');

var name = 'product';

amqp.Initialize(name);

var msgNo = 1;

setInterval(function () {
    var msg = {
        payload:{
            message: 'test',
            severity: 'info',
            service: 'mock'
        },
        responceNeeded: false
    };

    amqp.SendMessage(name, msg);


    // amqp.Log('info', 'something');
}, 20);
