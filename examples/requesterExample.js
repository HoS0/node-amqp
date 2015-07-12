var amqp = require('../amqp');

var name = 'customer';

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
    
    //amqp.SendMessage('logger', msg);


    amqp.Log('info', 'something');
}, 20);  
