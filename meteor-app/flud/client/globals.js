const knownErrors = ['InvalidArgument', 'Unauthorized', 'PasswordsNotMatched', 'PasswordRequirementsNotMet', 'RequiredFieldsMissing', 'EmailInUse'];

// Check if error is known
getErrorMessage = function(error) {
    var errorName = error && error.error;

    if (_.contains(knownErrors, errorName)) {
        return error.reason;
    } else {
        return 'An internal error occurred.';
    }
};

// Reverse-geocode given location
reverseGeocode = function(geocoder, startPoint, endPoint) {
    // geocoder: a Google Maps API v3 geocoder object
    // startPoint/endPoint: [lng, lat]

    var startLoc = {lat: startPoint[1], lng: startPoint[0]},
        endLoc = {lat: endPoint[1], lng: endPoint[0]};

    var startResult, endResult;

    return new Promise(function(resolve, reject) {

        geocoder.geocode({ location: startLoc }, function(results, status) {
            if (status === 'OK') {
                var startResult = results[0];

                geocoder.geocode({ location: endLoc }, function(results, status) {
                    if (status === 'OK') {
                        var endResult = results[0];

                        return resolve({start: startResult, end: endResult});
                    } else {
                        return reject('Geocoder failed with status: ' + status);
                    }
                });

            } else {
                return reject('Geocoder failed with status: ' + status);
            }
        });

    }).then(function(res) {

        if (res.start && res.end) {
            var sData = {}, 
                eData = {};

            // Extract address components from results
            var sAddrComponents = res.start.address_components,
                eAddrComponents = res.end.address_components;

            for (let component of sAddrComponents) {
                if (component.types.indexOf('locality') > -1) {
                    sData.locality = component.short_name;
                } else if (component.types.indexOf('administrative_area_level_2') > -1) {
                    sData.administrative_area_level_2 = component.short_name;
                } else if (component.types.indexOf('administrative_area_level_1') > -1) {
                    sData.administrative_area_level_1 = component.short_name;
                } else if (component.types.indexOf('country') > -1) {
                    sData.country = component.short_name;
                }
            }

            for (let component of eAddrComponents) {
                if (component.types.indexOf('locality') > -1) {
                    eData.locality = component.short_name;
                } else if (component.types.indexOf('administrative_area_level_2') > -1) {
                    eData.administrative_area_level_2 = component.short_name;
                } else if (component.types.indexOf('administrative_area_level_1') > -1) {
                    eData.administrative_area_level_1 = component.short_name;
                } else if (component.types.indexOf('country') > -1) {
                    eData.country = component.short_name;
                }
            }  

            // Check that both start and end data have the same area info
            if (sData.locality !== eData.locality || sData.administrative_area_level_2 !== eData.administrative_area_level_2 || 
                sData.administrative_area_level_1 !== eData.administrative_area_level_1 || sData.country !== eData.country) {
                    return Promise.reject('Please make sure that all points on the line are in the same locality. ');
                }

            return Promise.resolve(sData);
        } else {
            return Promise.reject('No results found');
        }
    });
};

getClosestLocality = function(placeFinder, loc) {
    // geocoder: a Google Maps API v3 PlacesService object
    // loc: {lat: <number>, lng: <number>}

    return new Promise(function(resolve, reject) {
        // Get closest locality to the given location
        placeFinder.nearbySearch({
            location: loc,
            radius: 1,
            types: ['(regions)']
        }, function(results, status) {

            if (status === 'OK') {
                var placeId;

                for (let result of results) {
                    if (result.types.indexOf('locality') > -1) {
                        placeId = result.place_id;
                        break;
                    }
                }

                if (!placeId) {
                    return reject('No nearby locality found.');
                } else {
                    return resolve(placeId);
                }

            } else {
                return reject('Place finder failed with status: ' + status);
            }
        });

    });
};

getPlaceData = function(placeFinder, placeId) {

    return new Promise(function(resolve, reject) {
        // Get the place details for the placeId of the locality
        placeFinder.getDetails({
            placeId: placeId
        }, function(place, status) {

            if (status === 'OK') {

                var locData = {
                    placeId: placeId,
                    location: [place.geometry.location.lat(), place.geometry.location.lng()],
                    formatted_address: place.formatted_address,
                    viewport_bounds: place.geometry.viewport.toJSON()
                };

                // Extract address components from the place result
                for (let component of place.address_components) {
                    if (component.types.indexOf('locality') > -1) {
                        locData.locality = component.short_name;
                    } else if (component.types.indexOf('administrative_area_level_2') > -1) {
                        locData.administrative_area_level_2 = component.short_name;
                    } else if (component.types.indexOf('administrative_area_level_1') > -1) {
                        locData.administrative_area_level_1 = component.short_name;
                    } else if (component.types.indexOf('country') > -1) {
                        locData.country = component.short_name;
                    }
                }

                return resolve(locData);

            } else {
                return reject('Place finder failed with status: ' + status);
            }
        });
    });
};

hslToRgb = function(h, s, l) {
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
};

// convert a number to a color using hsl
numberToColorHsl = function(i, hueRange) {
    // as the function expects a value between 0 and 120, and red = 0° and green = 120°
    // we convert the input to the appropriate hue value
    var hue = (i * (hueRange[1] - hueRange[0]) + hueRange[0]) / 360; // var hue = i * 1.2 / 360;
    // we convert hsl to rgb (saturation 100%, lightness 50%)
    var rgb = hslToRgb(hue, 1, .5);
    // we format to css value and return
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0.5)'; 
}

Template.registerHelper('currentUser', function() {
    return Meteor.user();
});

Template.registerHelper('userEmail', function() {
    var user = Meteor.user();

    if (user) {
        return user.emails[0].address;
    }
});