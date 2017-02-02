const mongo_conn = require('./mongo_conn');
const GeoPoint = require('geopoint');
const SS = require('simple-statistics');

function check_extreme(point, localPoints) {
    //console.log(point.height)
    var heights = localPoints.map(function (data) {
        return data.height;
    });
    var rollingHeights = localPoints.map(function (data) {
        return data.rollingHeight;
    });

   
    console.log(rollingHeights);

    if (heights.length == 0) {
        return Promise.resolve(null);
    }

    var mean = SS.mean(rollingHeights);
    var sd = SS.standardDeviation(heights);
    if (sd == 0 || heights.length <= 4) {
        sd = 3;
    }

    var z_score = SS.zScore(point.height, mean, sd);
    var prob;
    if (z_score >= 0) {
        prob = 1 - SS.cumulativeStdNormalProbability(z_score);
    } else {
        prob = SS.cumulativeStdNormalProbability(z_score);
    }
    
    console.log("Z-socre:")
    console.log(mean);
    console.log(sd);
    console.log(z_score);
    console.log(prob);
    

    if (prob <= .05) {
        // Is extreme value
        return Promise.resolve((prob*point.height)/localPoints.length);
    }

    return Promise.resolve(null);
}

// Calculate the average height of a set of local points and divide it 
function average(localPoints) {
    let sum = 0;
    let avg = 0;

    for (let point of localPoints) {
        sum = sum + point.height;
    }

    avg = sum / (localPoints.length * localPoints.length);

    let averages = [];

    for (let point of localPoints) {
        averages.push({ _id: point._id, height: avg });
    }

    return Promise.resolve(averages);
}

// Query the db collection 'col' for points within the bounding box around 'geopoint' with radius 'radius' (in km)
function queryBoundingBox(geopoint, radius, col) {
    var boundingBox = geopoint.boundingCoordinates(radius, true);

    return col.find({
        location: {
            $geoWithin: {
                $box: [
                    [boundingBox[0].longitude(), boundingBox[0].latitude()], // SW coordinate
                    [boundingBox[1].longitude(), boundingBox[1].latitude()]  // NE coordinate
                ]
            }
        }
    }).toArray();
}

let exportedFunctions = {
    // Performs various statistical calculations and adds a new datapoint to the db
    addDataPoint: (dataPoint) => {
        let DataPoints;

        return mongo_conn.then(db => {

            DataPoints = db.collection('datapoints');

            // Query datapoints the 4 different zoom bounding boxes
            var geopoint = new GeoPoint(dataPoint.location[1], dataPoint.location[0]);

            return Promise.all([
                queryBoundingBox(geopoint, 0.015, DataPoints),   // 10 m (locality)
                queryBoundingBox(geopoint, 0.1, DataPoints),    // 100 m (administrative_area_level_2)
                queryBoundingBox(geopoint, 1, DataPoints),      // 1 km (administrative_area_level_1)
                queryBoundingBox(geopoint, 10, DataPoints)      // 10 km (country)
            ]);

        }).then(localPoints => {

            return check_extreme(dataPoint, localPoints[0]).then(rollOverAmt => {

                if (rollOverAmt !== null) {
                    // Roll over
                    console.log('Is Extreme. Roll over by ' + rollOverAmt);

                    for (let point of localPoints[0]) {
                        DataPoints.update({ _id: point._id }, { $set: { 'rollingHeight': (point.rollingHeight + rollOverAmt) } }) 
                    }   

                    return Promise.resolve(false);
                }

                return DataPoints.insert(dataPoint).then(inserted => {
                    for (let local of localPoints) {
                        local.push(dataPoint)
                    }

                    return Promise.all([
                        average(localPoints[0]),
                        average(localPoints[1]),
                        average(localPoints[2]),
                        average(localPoints[3]),
                    ]);
                });
            });

        }).then(averages => {

            if (!averages) {
                return Promise.resolve(false);
            }

            let updatePromises = [];

            // Update divided averages for each area level
            for (let avgPoint of averages[0]) {

                updatePromises.push(
                    DataPoints.update({ _id: avgPoint._id }, { $set: { 'avgHeights.locality': avgPoint.height } })
                );
            }
            for (let avgPoint of averages[1]) {

                updatePromises.push(
                    DataPoints.update({ _id: avgPoint._id }, { $set: { 'avgHeights.administrative_area_level_2': avgPoint.height } })
                );
            }
            for (let avgPoint of averages[2]) {

                updatePromises.push(
                    DataPoints.update({ _id: avgPoint._id }, { $set: { 'avgHeights.administrative_area_level_1': avgPoint.height } })
                );
            }
            for (let avgPoint of averages[3]) {

                updatePromises.push(
                    DataPoints.update({ _id: avgPoint._id }, { $set: { 'avgHeights.country': avgPoint.height } })
                );
            }

            return Promise.all(updatePromises);

        }).then(results => {

            return Promise.resolve(true);

        });
    }
};

module.exports = exportedFunctions;