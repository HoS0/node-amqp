module.exports = {

    RabbitMqServerAddress:      process.env.RABBIT_URL || 'localhost',
    RabbitMqServerPort:         process.env.RABBIT_PORT || 5672,

    RabbitMqServerUsername:     process.env.RABBIT_USERNAME || 'guest',
    RabbitMqServerPassword:     process.env.RABBIT_PASSWORD || 'guest',

    RabbitMqServerConnectionTimeOut: process.env.RABBIT_TIMEOUT || 10000,
    
    logger: 'logger',

    ExchangeType: 'direct',
    ExchangeDurable: false,
    ExchangeAutoDelete: true
};
