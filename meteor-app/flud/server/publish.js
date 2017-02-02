Meteor.publish('userData', function () {
    return Meteor.users.find({_id: this.userId}, {fields: {favorites: 1}});
});

Meteor.publish('datapoints', (filters) => {
    var query = DataPoints.query();

    // Apply all filters
    for (let fName in filters) {
        query.filter(fName, true, filters[fName]);
    }

    return query.execute();
});

Meteor.publish('datalines', (filters) => {
    var query = DataLines.query();

    // Apply all filters
    for (let fName in filters) {
        query.filter(fName, true, filters[fName]);
    }

    return query.execute();
});
