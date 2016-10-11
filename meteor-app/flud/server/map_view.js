Meteor.methods({
    add_point: function (data) {
        check(data, {
            height: Number,
            latitude: Number,
            longitude: Number
        });

        DataPoints.insert(data);
    },
    randomize: function () {
        console.log("change");
        var dataPoints = DataPoints.find().fetch();
        for (let point of dataPoints) {
            DataPoints.update({ _id: point._id }, { latitude: point.latitude, longitude: point.longitude, height: Math.random() * 100 });
        }
    }
});
