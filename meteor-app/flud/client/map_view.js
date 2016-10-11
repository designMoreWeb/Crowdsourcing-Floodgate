import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './views/map_view.html';

Template.map_view.onCreated(function () {
    var self = this;

    // Subscribe template to the datapoints collection
    this.subscribe('datapoints');

    // Internal data for the template
    this.map = new ReactiveVar();
    this.querying = false;

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('exampleMap', function (map) {

        self.map.set(map);

        self.geocoder = new google.maps.Geocoder;

        self.heatMapData = new google.maps.MVCArray([]);

        // Initialize the heatmap
        self.heatMap = new google.maps.visualization.HeatmapLayer({
            data: self.heatMapData,
            map: map.instance
        });

        google.maps.event.addListener(map.instance, 'click', function (event) {
            // Only query if not currently querying
            if (self.querying) {
                return;
            }

            self.querying = true;

            // Snap point to road
            $.ajax({
                method: 'GET',
                url: 'https://roads.googleapis.com/v1/snapToRoads',
                data: {
                    path: event.latLng.lat() + ',' + event.latLng.lng(),
                    key: 'AIzaSyAixYo-thWvStv30hqGZ9DZeT3IItN7atU'
                }
            })
            .done(function (msg) {

                if (msg.snappedPoints) {

                    var point = msg.snappedPoints[0];

                    if (self.addMarker) {
                        // Unset the current add marker if it exists
                        self.addMarker.setMap(null);
                    }

                    // Set the current add marker location within the template
                    self.addMarkerLoc = { lat: point.location.latitude, lng: point.location.longitude };

                    // Set new add marker
                    self.addMarker = new google.maps.Marker({
                        draggable: false,
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(point.location.latitude, point.location.longitude),
                        map: map.instance,
                        id: point.placeId
                    });

                    google.maps.event.addListener(self.addMarker, 'click', function () {
                        $('#upload-modal').modal('show');
                    });
                }

                self.querying = false;
            });
        });

        // Update heatmap data
        self.autorun(function () {
            var map = self.map.get();

            /*
            var random = Math.floor(Math.random() * 100);

            if (random > 70) {
                Meteor.call("randomize", function (error, result) {
                    if (error) {
                        console.log(error);
                    }
                });
            }
            */
            
            if (map) {
                var dataPoints = DataPoints.find().fetch();

                if (dataPoints.length) {
                    self.heatMapData.clear();

                    for (let point of dataPoints) {
                        self.heatMapData.push({ location: new google.maps.LatLng(point.latitude, point.longitude), weight: point.height });
                    }
                }
            }
        });
    });
});

Template.map_view.onRendered(function () {
    var self = this;

    GoogleMaps.load({ v: '3', key: 'AIzaSyAixYo-thWvStv30hqGZ9DZeT3IItN7atU', libraries: 'visualization,places,geometry' });
});

Template.map_view.helpers({
    exampleMapOptions: function () {
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
    'click #submit-upload': function () {
        $('form[name=data-upload-form]').submit();
    },
    'submit form[name=data-upload-form]': function (e, template) {
        e.preventDefault();

        // Grab data from serialized form
        var data = $(e.target).serializeArray().reduce(function (obj, item) {
            if (!isNaN(item.value)) {
                obj[item.name] = +item.value;
            } else {
                obj[item.name] = item.value;
            }
            
            return obj;
        }, {});

        // Reverse-geocode selected location
        template.geocoder.geocode({ 'location': template.addMarkerLoc }, function (results, status) {
            if (status === 'OK') {
                if (results[1]) {
                    // Extract address components from results
                    var addrComponents = results[1].address_components;

                    for (let component of addrComponents) {
                        if (component.types.indexOf('locality') > -1) {
                            data.locality = component.short_name;
                        } else if (component.types.indexOf('administrative_area_level_2') > -1) {
                            data.administrative_area_level_2 = component.short_name;
                        } else if (component.types.indexOf('administrative_area_level_1') > -1) {
                            data.administrative_area_level_1 = component.short_name;
                        } else if (component.types.indexOf('country') > -1) {
                            data.country = component.short_name;
                        }
                    }

                    // Add latitude and longitude of the data point
                    data.latitude = template.addMarkerLoc.lat;
                    data.longitude = template.addMarkerLoc.lng;

                    Meteor.call("add_point", data, function (error, result) {
                        if (!error) {
                            $('#upload-modal').modal('hide');

                            template.addMarker.setMap(null);
                        } else {
                            console.log(error);
                        }
                    });
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    },
    'hidden.bs.modal #upload-modal': function() {
        // Clear all input fields on modal hidden
        $('#upload-modal input').each(function () {
            $(this).val('');
        });
    }
});
