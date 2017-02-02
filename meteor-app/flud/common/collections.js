DataLines = new Mongo.Collection('datalines');        

DataLines.schema = new SimpleSchema({
    type: {
        type: String,
        allowedValues: ['f', 's'],
        label: 'Data type ("f" for flooding, "s" for snow)'
    },
    weight: {
        type: Number,
        label: 'Line weight'
    },
    shape: {
        type: Object,
    },
    'shape.type': {
        type: String
    },
    'shape.coordinates': {
        type: Array,
        decimal: true,
        minCount: 2,
        label: 'Array of coordinates for the data line'
    },
    'shape.coordinates.$': {
        type: [Number],
        decimal: true,
        minCount: 2,
        maxCount: 2,
        label: 'Lng/Lat pairs for individual coordinates on the data line'
    },
    locality: {
        type: String,
        label: 'Locality of the data line'
    },
    administrative_area_level_2: {
        type: String,
        optional: true,
        label: 'Administrative level 2 of the data line'
    },
    administrative_area_level_1: {
        type: String,
        optional: true,
        label: 'Administrative level 1 of the data line'
    },
    country: {
        type: String,
        label: 'Country of the data line'
    },
    createdAt: {
        type: Date,
        label: 'Time of data line entry'
    }
});

// Main collection that the client draws from
DataPoints = new Mongo.Collection('datapoints');

DataPoints.schema = new SimpleSchema({
    type: {
        type: String,
        allowedValues: ['f', 's'],
        label: 'Data type ("f" for flooding, "s" for snow)'
    },
    height: {
        type: Number,
        label: 'Flood height'
    },
    rollingHeight: {
        type: Number,
        label: 'Rolling average flood height'
    },
    avgHeights: {
        type: Object,
        label: 'Average heights for different zoom levels.',
        optional: true
    },
    location: {
        type: [Number],
        decimal: true,
        minCount: 2,
        maxCount: 2,
        label: 'Data point location'
    },
    formatted_address: {
        type: String,
        label: 'Formatted address of data point'
    },
    locality: {
        type: String,
        label: 'Locality of data point'
    },
    administrative_area_level_2: {
        type: String,
        optional: true,
        label: 'Administrative level 2 of data point'
    },
    administrative_area_level_1: {
        type: String,
        optional: true,
        label: 'Administrative level 1 of data point'
    },
    country: {
        type: String,
        label: 'Country of data point'
    },
    createdAt: {
        type: Date,
        label: 'Time of data point entry'
    }
});

DataLines.filters({
    type: function(type) {
        return { type: type };
    },
    locality: function(locality) {
        return { locality: locality };
    },
    adminAreaLv2: function(adminAreaLv2) {
        return { administrative_area_level_2: adminAreaLv2 };
    },
    adminAreaLv1: function(adminAreaLv1) {
        return { administrative_area_level_1: adminAreaLv1 };
    },
    country: function(country) {
        return { country: country };
    },
    /*
    timeline: function(placeId) {
        let minMaxPairs = DataPoints.aggregate([
            {
                $group: {
                    _id: "$locality",
                    minDate: { $min: '$createdAt' },
                    maxDate: { $max: '$createdAt' }
                }
            }
        ]);

        let timelineBounds = minMaxPairs.filter(function(elem) {
            elem._id === placeId;
        })[0];

        console.log(timelineBounds);

        if (lower && upper) {
            return {$and: [ {createdAt: {$lt: upper.toISOString()}}, {createdAt: {$gt: lower.toISOString()}} ]};
        } else if (upper) {
            return {createdAt: {$lt: upper.toISOString()}};
        } else if (lower) {
            return {createdAt: {$gt: lower.toISOString()}};
        }
    }
    */
});

// Collection for archiving old data
DataPointsArchive = new Mongo.Collection('datapointsarchive');

if (Meteor.isServer) {
    DataPoints._ensureIndex({ location: "2dsphere" });
}