const rabbit_conn = require('./rabbit_conn');
const jobData = require('./data/jobData');

rabbit_conn.then(ch => {

    return ch.assertQueue('dp_queue').then(function(ok) {
        console.log('Worker listening for jobs...');

        return ch.consume('dp_queue', function(msg) {
            if (msg === null) {
                return ch.nack(msg, false, false);
            }

            let data = JSON.parse(msg.content.toString());

            return jobData.addDataPoint(data).then(ok => {
                return ch.ack(msg);
            }).catch(error => {
                console.warn(error);
                return ch.nack(msg, false, false);
            });
        });
    });

}).catch(console.warn);