// Add parameters to filter query by location
Meteor.publish('datapoints', function() {
    return DataPoints.find();
});
