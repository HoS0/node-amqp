var amqp = require('amqp');
var Guid = require('guid');
var globalConstant = require('./src/globalConstant');
var async = require('async');

var pendingRequests = [];
var publishingExchanges = [];

var connectionOption = {
    host: globalConstant.RabbitMqServerAddress,
    port: globalConstant.RabbitMqServerPort,
    login: globalConstant.RabbitMqServerUsername,
    password: globalConstant.RabbitMqServerPassword,
    connectionTimeout: globalConstant.RabbitMqServerConnectionTimeOut,
    authMechanism: 'AMQPLAIN',
    vhost: '/',
    noDelay: true,
    ssl: {
        enabled: false
    }
};

var connection = amqp.createConnection(connectionOption);
var isConnected = false;
var hostService;
var uniqueGuid = Guid.create();
var responceRequestFunction = null;

connection.on('ready', function () {
    isConnected = true;
});

var publishMessage = function (publishingExchange, processId, message, callback) {
    
    var publishOptions = {
        contentType: 'application/json',
        deliveryMode: 1,
        priority: 8
    }
    
    if (message.responceNeeded) {
        var pendingRequest = {
            id: Guid.create(),
            callback: callback
        }
        
        pendingRequests.push(pendingRequest);
        
        message.id = pendingRequest.id;
        
        if (hostService)
            message.sender = hostService;
    }
    
    publishingExchange.publish(processId, message, publishOptions);
    
    return true;
}

var _sendMessage = function (serviceName, message, callback) {
    var serviceNameSeparated = serviceName.split('.');
    
    var service = serviceNameSeparated[0];
    var processId = serviceNameSeparated[1];
    
    if (!processId)
        processId = '';
    
    if (isConnected) {
        
        var exchangeFound = false;
        
        publishingExchanges.forEach(function (publishingExchange) {
            if (publishingExchange && publishingExchange.name === service) {
                
                exchangeFound = true;
                publishMessage(publishingExchange, processId, message, callback);
            }
        });
        
        if (exchangeFound === true)
            return true;
        
        var exchangeOption = {
            type: globalConstant.ExchangeType,
            durable: globalConstant.ExchangeDurable,
            autoDelete: globalConstant.ExchangeAutoDelete
        };
        
        return connection.exchange(service, exchangeOption, function (exchange) {
            publishingExchanges.push(exchange);
            return publishMessage(exchange, processId, message, callback);
        });
    }
    
    return false;
}

module.exports = {
    Initialize: function (serviceName, callback) {
        serviceName += "." + uniqueGuid;
        hostService = serviceName;
        var connection = amqp.createConnection(connectionOption);
        var serviceNameSeparated = serviceName.split('.');
        
        var service = serviceNameSeparated[0];
        var processId = serviceNameSeparated[1];
        
        connection.on('ready', function () {
            
            var exchangeOption = {
                type: globalConstant.ExchangeType,
                durable: globalConstant.ExchangeDurable,
                autoDelete: globalConstant.ExchangeAutoDelete
            };
            
            connection.exchange(service, exchangeOption, function (exchange) {
                
                connection.exchange(service, exchangeOption, function (exchange) {
                    
                    connection.queue(serviceName, function (q) {
                        q.bind(exchange.name, processId);
                        
                        if (callback)
                            callback();

                        q.subscribe(function (message, headers, deliveryInfo, messageObject) {
                            if (message) {

                                var found = false;

                                var msgToDelIndexes = [];

                                findPendingRequest = function (pendingRequest) {

                                    if (found !== true && pendingRequest.id.value === message.id) {
                                        
                                        var index = pendingRequests.indexOf(pendingRequest);
                                        msgToDelIndexes.push(index);

                                        if (pendingRequest.callback) {
                                            found = true;
                                            pendingRequest.callback(message);
                                        }
                                    }
                                }

                                async.each(pendingRequests, function(file, callback) {
                                    findPendingRequest(file);
                                    callback();

                                }, function(err){
                                    if( err ) {
                                    } else {

                                        if(found === false && responceRequestFunction)
                                            responceRequestFunction(message);

                                        msgToDelIndexes.forEach(function(msg) {
                                            pendingRequests.splice(msg, 1);
                                        });
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
    },
    CreateRequestQueue: function (serviceName, responceRequest) {
        responceRequestFunction = responceRequest;

        serviceName += "." + uniqueGuid;
        hostService = serviceName;
        var connection = amqp.createConnection(connectionOption);
        var serviceNameSeparated = serviceName.split('.');
        
        var service = serviceNameSeparated[0];
        var processId = serviceNameSeparated[1];
        
        connection.on('ready', function () {
            
            var exchangeOption = {
                type: globalConstant.ExchangeType,
                durable: globalConstant.ExchangeDurable,
                autoDelete: globalConstant.ExchangeAutoDelete
            };
            
            connection.exchange(service, exchangeOption, function (exchange) {
                
                connection.queue(service, function (q) {
                    
                    q.bind(exchange.name, '');
                    
                    q.subscribe(function (message) {
                        responceRequest(message);
                    });
                });
            });
        });
    },
    SendMessage: function (serviceName, message, callback) {
        return _sendMessage(serviceName, message, callback);
    },
    CreateGuid: function() {
        return Guid.create();
    },
    Log: function (severity , msg, stacktrace) {
        
        try {
            
            var msgToSend = {
                responceNeeded: true,
                action: 'create',
                type: globalConstant.logger,
                payload: {
                    severity: severity,
                    service: hostService,
                    stacktrace: stacktrace,
                    message: msg
                },
                service: hostService,
                date: new Date()
            };
            
            _sendMessage(globalConstant.logger, msgToSend, function (msg) {
                if (msg.error !== 0)
                    console.log('amqp log error: ' + msg.error);
            });
        } catch (e) {
        // ignore
        }
    }
}
