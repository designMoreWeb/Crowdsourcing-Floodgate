import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './views/map_view.html';

Template.map_view.onCreated(function() {
    var self = this;

    // counter starts at 0
    this.subscribe('datapoints');

    this.addMarker = new ReactiveVar();
    this.querying = false;
    
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {
        // Add a marker to the map once it's ready
        var marker = new google.maps.Marker({
            position: map.options.center,
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
    });
});

Template.map_view.onRendered(function() {
    GoogleMaps.load({ v: '3', key: 'AIzaSyAixYo-thWvStv30hqGZ9DZeT3IItN7atU', libraries: 'geometry, places' });
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
