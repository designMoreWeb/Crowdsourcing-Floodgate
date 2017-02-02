const rabbit_conn = require('amqplib').connect('amqp://localhost');
const gju = require('geojson-utils');

/*
function cutGeoJSONLineString(line, intersectCoords, newWeight) {
    if (intersectCoords[0][0] === line.shape.coordinates[0][0] && intersectCoords[0][1] === line.shape.coordinates[0][1]) {

    }
    for (let coord of intersectCoords) {

    }
}
*/

Meteor.methods({
    addPoint: function (data) {
        data.createdAt = new Date();

        DataPoints.schema.validate(data);

        data._id = Random.id();

        rabbit_conn.then(conn => {
            return conn.createChannel();
        }).then(function (ch) {
            return ch.assertQueue('dp_queue', { durable: true }).then(function (ok) {
                return ch.sendToQueue('dp_queue', new Buffer(JSON.stringify(data)), { persistent: true });
            });
        }).catch(console.warn);
    },
    addLine: function(data) {
        data.createdAt = new Date();

        DataLines.schema.validate(data);

        data._id = Random.id();

        /*
        var intersects = DataLines.find({shape: {$geoIntersects: {$geometry: data.shape}}}).fetch();

        for (let line of intersects) {
            // Get intersection line
            let intersectPoints = gju.lineStringsIntersect(line.shape, data.shape);
            let hash = {};
            let rawCoords = [];

            // Filter out dups and map to raw coordinates
            for (let point of intersectPoints) {
                let key = point.coordinates.join('|');

                if (!hash[key]) {
                    rawCoords.push(point.coordinates);
                    hash[key] = 'found';
                }
            }

            // Cut up intersected line
            console.log(rawCoords);

            let cutNewLines = cutGeoJSONLineString(data, rawCoords, data.weight);
            let

        }
        */
  
        DataLines.insert(data);
    }
    /*
    randomize: function () {
        var dataPoints = DataPoints.find().fetch();

        for (let point of dataPoints) {
            DataPoints.update({ _id: point._id }, { location: [point.latitude, point.longitude], height: Math.random() * 100 });
        }
    }
    */
});
