Meteor.methods({
    add_point: function (data) {
        check(data, {
            height: Number,
            latitude: Number,
            longitude: Number,
            locality: Match.Maybe(String),
            administrative_area_level_2: Match.Maybe(String),
            administrative_area_level_1: Match.Maybe(String),
            country: Match.Maybe(String)
        });

        data.createdAt = new Date();

        DataPoints.insert(data);
    },
    randomize: function () {
        var dataPoints = DataPoints.find().fetch();
        
        for (let point of dataPoints) {
            DataPoints.update({ _id: point._id }, { latitude: point.latitude, longitude: point.longitude, height: Math.random() * 100 });
        }
    }
});
