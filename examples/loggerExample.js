var amqp = require('../amqp');

var name = 'customer';

var msgNo = 1;
var logger = 'logger';

var log = function (severity , msg, stacktrace) {
    
    try {
        
        var msgToSend = {
            responceNeeded: true,
            action: 'create',
            type: logger,
            payload: {
                severity: severity,
                service: name,
                stacktrace: stacktrace,
                message: msg
            },
            service: name,
            date: new Date()
        };
        
        amqp.SendMessage(logger, msgToSend, function (msg) {
            if (msg.error !== 0)
                console.log(msg.error);
        });
    } catch (e) {
        // ignore
    }
}

var logTest = function () {

    try {
        throw new Error();
    } catch (e) {
        amqp.log('error', "mock error message with stack -----------", e.stack);
    } 
}

var retrieveLogTest = function() {
    
    var msg = {
        type: 'logger',
        action: 'retrieve',
        payload: {
            //service: [
            //    'customer'
            //],
            severity: [
                'info'
            ]//,
            //date: {
            //    from: new Date('2015-06-21T12:35:30.957Z')
            //}
        },
        responceNeeded: true
    };
    
    console.log('message sent.');
    
    amqp.SendMessage('logger', msg, function (msg) {
        //console.log('responce', msg.payload, msg.error);
        console.log('--------------------------', msg.payload.length);
    });
}

amqp.Initialize(name, function () {

    //logTest();

    retrieveLogTest();
});

