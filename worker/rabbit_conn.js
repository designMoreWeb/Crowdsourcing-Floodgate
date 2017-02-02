const configData = require('./data/configData');
const rabbit = require('amqplib');
let rabbit_conn;

// Connection to RabbitMQ
let rabbitConnection = () => {
    if (!rabbit_conn) {
        rabbit_conn = rabbit.connect(configData.rabbitServer)
            .then(conn => {
                return conn.createChannel();
            });
    }

    return rabbit_conn;
};

module.exports = rabbitConnection();