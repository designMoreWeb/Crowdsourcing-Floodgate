DataPoints = new Mongo.Collection('datapoints', {
    transform: function (doc) {
        return doc;
    }
});
