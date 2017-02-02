Template.nav.onCreated(function () {
    this.search = new ReactiveVar();

    Session.set('dataView', 'f');
});

Template.nav.onRendered(function () {
    var self = this;

    GoogleMaps.ready('fludMap', function (map) {

        self.placeFinder = new google.maps.places.PlacesService(map.instance);

        // Function for adding a listener for enter on the search box input to pick the first suggested result
        function pacSelectFirst(input) {
            // store the original event binding function
            var _addEventListener = (input.addEventListener) ? input.addEventListener : input.attachEvent;

            function addEventListenerWrapper(type, listener) {
                // Simulate a 'down arrow' keypress on hitting 'return' when no pac suggestion is selected,
                // and then trigger the original listener.

                if (type == "keydown") {
                    var orig_listener = listener;
                    listener = function (event) {
                        var suggestion_selected = $(".pac-item-selected").length > 0;

                        if ((event.which == 13 || event.keyCode == 13) && !suggestion_selected) {
                            var simulated_downarrow = $.Event("keydown", {keyCode:40, which:40})
                            orig_listener.apply(input, [simulated_downarrow]);
                        }

                        orig_listener.apply(input, [event]);
                    };
                }

                // add the modified listener
                _addEventListener.apply(input, [type, listener]);
            }

            if (input.addEventListener)
                input.addEventListener = addEventListenerWrapper;
            else if (input.attachEvent)
                input.attachEvent = addEventListenerWrapper;
        }

        // Search listener: update 'currentLocation' session var on location search
        function findPlace() {
            // MUST BE CALLED AS CALLBACK TO A GOOGLE MAPS AUTOCOMPLETE OBJ
            var place = this.getPlace();

            if (!place.geometry) {
                sAlert.info('No results found.');
                return;
            }

            var locData = {
                placeId: place.place_id,
                location: [place.geometry.location.lat(), place.geometry.location.lng()],
                formatted_address: place.formatted_address,
                viewport_bounds: place.geometry.viewport.toJSON()
            };

            // Extract address components from results
            var addrComponents = place.address_components;

            for (let component of addrComponents) {
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

            Session.set('currentLocation', locData);
        }


        // Initialize search bar for navbar
        var searchNav = document.getElementById('location-search-nav');
        var autocompleteNav = new google.maps.places.Autocomplete(searchNav, {
            types: ['(regions)']
        });

        autocompleteNav.bindTo('bounds', map.instance);

        autocompleteNav.addListener('place_changed', findPlace);

        pacSelectFirst(searchNav);

        // Initialize search bar for side menu
        var searchMenu = document.getElementById('location-search-menu');
        var autocompleteMenu = new google.maps.places.Autocomplete(searchMenu, {
            types: ['(regions)']
        });

        autocompleteMenu.bindTo('bounds', map.instance);

        autocompleteMenu.addListener('place_changed', findPlace);

        pacSelectFirst(searchMenu);

        // Set current location based on 'currentLocation' session var value
        self.autorun(function () {
            var currentLoc = Session.get('currentLocation');

            if (currentLoc) {
                self.search.set(currentLoc.formatted_address);

                map.instance.setOptions({
                    center: new google.maps.LatLng(currentLoc.location[0], currentLoc.location[1])
                });

                map.instance.fitBounds(new google.maps.LatLngBounds(
                    {lat: currentLoc.viewport_bounds.south, lng: currentLoc.viewport_bounds.west}, 
                    {lat: currentLoc.viewport_bounds.north, lng: currentLoc.viewport_bounds.east}
                ));
            }
        });
    });
});

Template.nav.helpers({
    getCurrentSearch: function () {
        return Template.instance().search.get();
    },
    favoriteLoc: function() {
        var user = Meteor.user();
        var currentLoc = Session.get('currentLocation');

        return user && currentLoc && user.favorites && user.favorites.filter(function(fav) { 
            return fav.placeId === currentLoc.placeId;
        });
    },
    isDataView: function(dataView) {
        return (Session.get('dataView') === dataView) ? 'checked' : '';
    }
});

Template.nav.events({
    'change input[name=location-search]': function (e, template) {
        template.search.set($(e.target).val());
    },
    'click #fav-btn': function(e) {
        var currentLoc = Session.get('currentLocation');

        Meteor.call('toggleFavorite', currentLoc.placeId, currentLoc.formatted_address, function(error, result) {
            if (error) {
                sAlert.error(getErrorMessage(error));
            }
        });
    },
    'change input[name=timeline]': function (e) {
        if ($(e.target).is(":checked")) {
            Session.set('timelineView', 1);
        } else {
            Session.set('timelineView', 0);
        }
    },
    'change input[name=data-view-filters]': function(e, template) {
        var $checked = $('input[name=data-view-filters]:checked');

        Session.set('dataView', $checked.val());
    },
    'click .go-to-fav': function(e, template) {
        e.preventDefault();

        var placeId = $(e.target).closest('.go-to-fav').data('place');

        getPlaceData(template.placeFinder, placeId).then(function(locData) {
            Session.set('currentLocation', locData);
        }).catch(function (error) {
            console.warn(error);
        });
    },
    'click #show-sign-up': function (e) {
        document.querySelector('#sign-up-modal').showModal();
    },
    'click #submit-sign-up': function () {
        $('form[name=sign-up-form]').submit();
    },
    'submit form[name=sign-up-form]': function (e, template) {
        e.preventDefault();

        // Grab data from serialized form
        var signUpData = $(e.target).serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;

            return obj;
        }, {});

        Meteor.call('createAccount', signUpData, function (error, result) {
            if (error) {
                sAlert.error(getErrorMessage(error));
            } else {
                sAlert.success('Account successfully created! Please try logging in');
                document.querySelector('#sign-up-modal').close();
                document.querySelector('#sign-in-modal').showModal();
            }
        });
    },
    'click #show-sign-in': function (e) {
        document.querySelector('#sign-in-modal').showModal();
    },
    'click #submit-sign-in': function () {
        $('form[name=sign-in-form]').submit();
    },
    'submit form[name=sign-in-form]': function (e, template) {
        e.preventDefault();

        // Grab data from serialized form
        var signInData = $(e.target).serializeArray().reduce(function (obj, item) {
            obj[item.name] = item.value;

            return obj;
        }, {});

        Meteor.loginWithPassword(signInData.email, signInData.password, function (error) {
            if (error) {
                var errorMessage;

                // Get a human-readable error message
                switch (error.error) {
                    case 400:
                        errorMessage = 'Please enter a valid email address and password.';
                        break;
                    case 403:
                        errorMessage = 'Invalid email/password combination.';
                        break;
                    case 'too-many-requests':
                        errorMessage = 'Too many login attempts. Please try again later.';
                        break;
                }

                sAlert.error(errorMessage);
            } else {
                document.querySelector('#sign-in-modal').close();
                sAlert.success('Successfully logged in!');
            }
        });
    },
    'click #sign-out': function(e) {
        Meteor.logout(function(error) {
            if (error) {
                sAlert.error('An error occurred while logging out. Please try again.');
            }
        });
    }
})
