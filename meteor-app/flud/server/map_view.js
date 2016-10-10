Meteor.methods({
    timesTwo: function(num) {
        check(num, Number);

        return num * 2;
    },
    add_point: function(lat,long,weight) {
        DataPoints.insert({latitude: lat , longitude: long,  weight: weight});
    },

    randomize: function() {
      console.log("change");
        var dataPoints = DataPoints.find().fetch();
        for (let point of dataPoints) {
          DataPoints.update({_id : point._id}, {latitude: point.latitude, longitude: point.longitude,  weight: Math.random()*100});
        }

    }
});
