import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './views/map_view.html';

Template.map_view.onCreated(function() {
    var self = this;

    // Subscribe template to the datapoints collection
    this.subscribe('datapoints');

    // Internal data for the template
    this.map = new ReactiveVar();

    this.addMarker = new ReactiveVar();
    this.querying = false;

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {

        self.map.set(map);

        self.heatMapData = new google.maps.MVCArray([]);

        // Initialize the heatmap
        self.heatMap = new google.maps.visualization.HeatmapLayer({
            data: self.heatMapData,
            map: map.instance

        });

        google.maps.event.addListener(map.instance, 'click', function(event) {
            // Only query if not currently querying
            if (!self.querying) {

                self.querying = true;

                $.ajax({
                    method: 'GET',
                    url: 'https://roads.googleapis.com/v1/snapToRoads',
                    data: {
                        path: event.latLng.lat() + ',' + event.latLng.lng(),
                        key: 'AIzaSyAixYo-thWvStv30hqGZ9DZeT3IItN7atU'
                    }
                })
                .done(function(msg) {

                    if (msg.snappedPoints) {
                        var currentAddMarker = self.addMarker.get();
                        var point = msg.snappedPoints[0];

                        if (currentAddMarker) {
                            // Unset the current add marker if it exists
                            currentAddMarker.setMap(null);
                        }

                        // Set new add marker
                        self.addMarker.set(new google.maps.Marker({
                            draggable: false,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(point.location.latitude, point.location.longitude),
                            map: map.instance,
                            id: point.placeId
                        }));
                    }

                    self.querying = false;
                });
            }
        });

        // Update heatmap data
        self.autorun(function() {
            var map = self.map.get();

            if (map) {
                var dataPoints = DataPoints.find().fetch();

                if (dataPoints.length) {
                    self.heatMapData.clear();

                    for (let point of dataPoints) {
                        self.heatMapData.push({location: new google.maps.LatLng(point.latitude, point.longitude), weight: point.height});
                    }
                }
            }
        });
    });
});

Template.map_view.onRendered(function() {
    var self = this;

    GoogleMaps.load({ v: '3', key: 'AIzaSyAixYo-thWvStv30hqGZ9DZeT3IItN7atU', libraries: 'visualization, geometry, places' });
});

Template.map_view.helpers({
    exampleMapOptions: function() {
        var latLng = Geolocation.latLng();

        // Initialize the map once we have the latLng.
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: 15
            };
        }
    }
});

Template.map_view.events({

});
