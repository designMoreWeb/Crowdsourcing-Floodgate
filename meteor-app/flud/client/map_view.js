var math = require('mathjs');

Template.map_view.onCreated(function () {
    var self = this;

    // Internal data for the template
    this.addMarkers = [];
    this.dataLines = [];
    this.querying = false;
    this.geoLocAcquired = new ReactiveVar(false);
    this.polylineSet = new ReactiveVar(false);

    this.removeAddMarkers = function() {
        if (self.addMarkers.length) {
            for (let marker of self.addMarkers) {
                marker.setMap(null);
            }

            self.addMarkers = [];
        }
        
        if (self.addPolyline) {
            self.addPolyline.setMap(null);
            delete self.addPolyline;

            self.polylineSet.set(false);
        }  
    };

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('fludMap', function (map) {

        self.geocoder = new google.maps.Geocoder;
        self.placeFinder = new google.maps.places.PlacesService(map.instance);
        self.directionsService = new google.maps.DirectionsService();       

        self.drawAddPolyline = function(path) {
            if (self.addPolyline) {
                self.addPolyline.setMap(null);
            }

            self.addPolyline = new google.maps.Polyline({
                path: path,
                strokeColor: '#3e8899',
                strokeWeight: 5,
                strokeOpacity: 1,
                map: map.instance,
                clickable: false
            });

            self.polylineSet.set(true);
        };

        // Snap to road listener
        google.maps.event.addListener(map.instance, 'click', function (event) {
            // Only query if not in timelineView and not currently querying
            if (Session.get('timelineView') || !Session.get('currentLocation') || self.querying) {
                return;
            }

            self.querying = true;

            // Snap point to road
            $.ajax({
                method: 'GET',
                url: 'https://roads.googleapis.com/v1/snapToRoads',
                data: {
                    path: event.latLng.lat() + ',' + event.latLng.lng(),
                    key: Meteor.settings.public.GMAPS_API_KEY
                }
            }).done(function (msg) {

                if (msg.snappedPoints) {

                    var point = msg.snappedPoints[0];

                    if (self.addMarkers.length < 2) {

                        self.addMarkers.push(new google.maps.Marker({
                            draggable: false,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(point.location.latitude, point.location.longitude),
                            map: map.instance,
                            id: point.placeId
                        }));
                        
                    } else if (self.addMarkers.length === 2) {

                        self.addMarkers[0].setMap(null);

                        self.addMarkers.shift();

                        self.addMarkers.push(new google.maps.Marker({
                            draggable: false,
                            animation: google.maps.Animation.DROP,
                            position: new google.maps.LatLng(point.location.latitude, point.location.longitude),
                            map: map.instance,
                            id: point.placeId
                        }));
                    }

                    if (self.addMarkers.length === 2) {   

                        var request = {
                            avoidFerries: true,
                            origin: self.addMarkers[0].position, 
                            destination: self.addMarkers[1].position,
                            travelMode: google.maps.DirectionsTravelMode.WALKING
                        };

                        self.directionsService.route(request, function(result, status) {
                            if (status == google.maps.DirectionsStatus.OK) {

                                var route = result.routes[0];
                                var points = new Array();
                                var legs = route.legs;

                                for (i = 0; i < legs.length; i++) {
                                    var steps = legs[i].steps;
                                    for (j = 0; j < steps.length; j++) {
                                        var nextSegment = steps[j].path;
                                        for (k = 0; k < nextSegment.length; k++) {
                                            points.push(nextSegment[k]);
                                        }
                                    }
                                }

                                var path = points;
                                self.drawAddPolyline(path);
                            }
                        });
                    }
                }

                self.querying = false;
            });
        });

        // Subscribe template to the datalines publish with filters once 'currentLocation' Session var is set
        self.autorun(function () {
            var currentLoc = Session.get('currentLocation');
            var currentView = Session.get('dataView');

            if (currentLoc && currentView) {
                var filters = {type: [currentView]};

                if (currentLoc.locality) {
                    filters['locality'] = [currentLoc.locality];
                }
                if (currentLoc.administrative_area_level_2) {
                    filters['adminAreaLv2'] = [currentLoc.administrative_area_level_2];
                }
                if (currentLoc.administrative_area_level_1) {
                    filters['adminAreaLv1'] = [currentLoc.administrative_area_level_1];
                }
                if (currentLoc.country) {
                    filters['country'] = [currentLoc.country];
                }

                // resubscribe to the datalines publish with the new filters
                self.subscribe('datalines', filters);
            }
        });

        // Reactively update heatmap data
        self.autorun(function () {
            var currentData = DataLines.find().fetch();
            var currentView = Session.get('dataView');

            var hueRange;

            if (currentView === 'f') {
                hueRange = [0, 120];
            } else if (currentView === 's') {
                hueRange = [180, 300];
            } else {
                return;
            }

            var max;

            // Get current max
            for (let line of currentData) {
                if (max === undefined || max < line.weight) {
                    max = line.weight;
                } 
            }

            // Remove currently drawn polylines
            for (let line of self.dataLines) {
                line.setMap(null);
            }
            
            self.dataLines = [];

            // Draw updated polylines
            for (let line of currentData) {
                self.dataLines.push(
                    new google.maps.Polyline({
                        path: (function() {
                            var linePath = new google.maps.MVCArray([]);

                            for (let point of line.shape.coordinates) {
                                linePath.push(new google.maps.LatLng(point[1], point[0]));
                            }

                            return linePath;
                        })(),
                        strokeColor: (function() {
                            return numberToColorHsl((1 - line.weight / max), hueRange);
                        })(),
                        strokeWeight: 5,
                        strokeOpacity: 1,
                        map: map.instance,
                        clickable: false
                    })
                );
            }
        });

        // Get current user location
        self.autorun(function () {
            if (!self.geoLocAcquired.get()) {
                var geoLoc = Geolocation.latLng();

                // If the user's geolocation was found, set the 'currentLocation' session var
                if (geoLoc) {

                    getClosestLocality(self.placeFinder, geoLoc).then(function (placeId) {
                        return getPlaceData(self.placeFinder, placeId);
                    }).then(function(locData) {                    
                        Session.set('currentLocation', locData);

                        self.geoLocAcquired.set(true);
                    }).catch(function (error) {
                        console.warn(error);
                    });
                }
            }
        });

        // Remove current add data marker (if it exists) when the timeline view is toggled on
        self.autorun(function() {
            var isTimeline = Session.get('timelineView');

            if (isTimeline) {
                self.removeAddMarkers();
            }
        });

        // Remove any add Markers/Lines that may be on the map when the location changes
        self.autorun(function() {
            var loc = Session.get('currentLocation');
            
            self.removeAddMarkers();
        })
    });
});

Template.map_view.onRendered(function () {
    GoogleMaps.load({ v: '3', key: Meteor.settings.public.GMAPS_API_KEY, libraries: 'visualization,places,geometry' });

    var dateSlider = document.getElementById('slider');
    var dateValue = document.getElementById('date');

    var today = new Date();
    var today_timestamp = today.getTime();
    today.setDate(today.getDate() - 1);
    var yesterday = today;
    
    // Create a new date from a string, return as a timestamp.
    function timestamp (str){
        return new Date(str).getTime();   
    };

    // Create a list of day and monthnames.
    var
        weekdays = [
            "Sunday", "Monday", "Tuesday",
            "Wednesday", "Thursday", "Friday",
            "Saturday"
        ],
        months = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

    // Append a suffix to dates.
    // Example: 23 => 23rd, 1 => 1st.
    function nth (d) {
        if (d>3 && d<21) return 'th';
        switch (d % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    };

    // Create a string representation of the date.
    function formatDate (date) {
        return weekdays[date.getDay()] + ", " +
            date.getDate() + nth(date.getDate()) + " " +
            months[date.getMonth()] + " " +
            date.getFullYear() + " " +
            date.getHours() + ":" + date.getMinutes();
    };

    noUiSlider.create(dateSlider, {
        // Create two timestamps to define a range.
        range: {
            min: yesterday.getTime(),
            max: today_timestamp
        },

        // Steps of one hour
        step: 60 * 60 * 1000,

        // Two more timestamps indicate the handle starting positions.
        start: today_timestamp
    });

    dateSlider.noUiSlider.on('update', function(values) {
        dateValue.innerHTML = formatDate(new Date(+values));
    });

});

Template.map_view.helpers({
    mapOptions: function () {
        // Initialize the map
        if (GoogleMaps.loaded()) {
            var mapObj = {
                styles: [
                    { "elementType": "geometry", "stylers": [{ "hue": "#ff4400" }, { "saturation": -68 }, { "lightness": -4 }, { "gamma": 0.72 }] },
                    { "featureType": "road", "elementType": "labels.icon" },
                    { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": -10 }, { "hue": "#ff4400" }, { "gamma": 1.2 }, { "saturation": -23 }] },
                    { "featureType": "landscape.man_made", "elementType": "geometry", "stylers": [{ "hue": "#0077ff" }, { "gamma": 3.1 }] },
                    { "featureType": "water", "stylers": [{ "hue": "#00ccff" }, { "gamma": 0.44 }, { "saturation": -33 }] },
                    { "featureType": "poi.park", "stylers": [{ "hue": "#44ff00" }, { "saturation": -23 }] },
                    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "hue": "#007fff" }, { "gamma": 0.77 }, { "saturation": 65 }, { "lightness": 99 }] },
                    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "gamma": 0.11 }, { "weight": 5.6 }, { "saturation": 99 }, { "hue": "#0091ff" }, { "lightness": -86 }] },
                    { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "lightness": -48 }, { "hue": "#ff5e00" }, { "gamma": 1.2 }, { "saturation": -23 }] },
                    { "featureType": "transit", "elementType": "labels.text.stroke", "stylers": [{ "saturation": -64 }, { "hue": "#ff9100" }, { "lightness": 16 }, { "gamma": 0.47 }, { "weight": 2.7 }] }
                ],
                zoom: 20,
                center: new google.maps.LatLng(20, -10),
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                zoomControl: false,
                rotateControl: true,
                streetViewControl: false,
                //scrollwheel: false,
                disableDoubleClickZoom: true
            };

            return mapObj;
        }
    },
    showSlider: function () {
        return Session.get('timelineView');
    },
    polylineSet: function() {
        return Template.instance().polylineSet.get();
    },
    dataViewName: function() {
        switch (Session.get('dataView')) {
            case 'f':
                return 'Flood';
            case 's':
                return 'Snow';
        }
    },
    getGradient: function(range) {
        switch (Session.get('dataView')) {
            case 'f':
                return 'flood';
            case 's':
                return 'snow';
        }
    },
    dataRange: function(range) {
        var currentData = DataLines.find().fetch();

        if (currentData.length) {
            var weights = Object.keys( currentData ).map(function ( index ) {
                return currentData[index].weight; 
            });
            
            switch (range) {
                case 'max':
                    return parseInt(math.max(weights));
                case 'med':
                    return parseInt(math.median(weights));
                case 'min':
                    return parseInt(math.min(weights));
            }
        } else {
            return '--';
        }
    }
});

Template.map_view.events({
    'click #add-data': function(e, template) {

        if (template.addPolyline) {
            document.querySelector('#upload-modal').showModal();
        } else {
            sAlert.error('Please drop at least two points on the map first.');
        }
    },
    'click #submit-upload': function () {
        $('form[name=data-upload-form]').submit();
    },
    'submit form[name=data-upload-form]': function (e, template) {
        e.preventDefault();

        if (!template.addPolyline) sAlert.error('Please drop at least two points on the map first.');

        var linePoints = template.addPolyline.latLngs.b[0].b;
        var lineData = {
            type: Session.get('dataView'),
            weight: +$('#upload-modal input[name=height]').val(),
            shape: {
                type: 'LineString',
                coordinates: linePoints.map(function(point) {
                    return [point.lng(), point.lat()];
                })
            }
        };
        var lastIdx = lineData.shape.coordinates.length - 1;

        // Reverse-geocode selected location
        reverseGeocode(template.geocoder, lineData.shape.coordinates[0], lineData.shape.coordinates[lastIdx]).then(function (locData) {
            $.extend(lineData, locData);

            // Add the new data point
            Meteor.call('addLine', lineData, function (error, result) {
                if (error) {
                    sAlert.error(getErrorMessage(error));
                } else {
                    sAlert.success('Data successfully added');

                    document.querySelector('#upload-modal').close();

                    // Clear all input fields on modal hidden
                    $('#upload-modal input').each(function () {
                        $(this).val('');
                    });

                    template.removeAddMarkers();
                }
            });
        }, function (error) {
            sAlert.error(error);
        });

        
    }
});
