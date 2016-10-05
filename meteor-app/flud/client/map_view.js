import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './views/map_view.html';

Template.map_view.onCreated(function() {
    // counter starts at 0
    this.subscribe('datapoints');
    
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function(map) {
        // Add a marker to the map once it's ready
        var marker = new google.maps.Marker({
            position: map.options.center,
            map: map.instance
        });
    });
});

Template.map_view.onRendered(function() {
    GoogleMaps.load({ v: '3', key: 'AIzaSyAixYo-thWvStv30hqGZ9DZeT3IItN7atU', libraries: 'geometry,places' });
});

Template.map_view.helpers({
    exampleMapOptions: function() {
        var latLng = Geolocation.latLng();

        // Initialize the map once we have the latLng.
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: 8
            };
        }
    }
});

Template.map_view.events({
    
});
