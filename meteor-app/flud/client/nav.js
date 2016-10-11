Template.nav.onCreated(function(){
    this.sideMenuState = new ReactiveVar("in");
    this.search = new ReactiveVar();
});

Template.nav.onRendered(function() {
    var self = this;

    GoogleMaps.ready('exampleMap', function (map) {
        // Initialize search bar for navbar
        var searchNav = document.getElementById('location-search-nav');
        var autocompleteNav = new google.maps.places.Autocomplete(searchNav);

        autocompleteNav.bindTo('bounds', map.instance);

        autocompleteNav.addListener('place_changed', function () {
            var place = autocompleteNav.getPlace();

            if (!place.geometry) {
                return;
            }

            if (place.geometry.viewport) {
                map.instance.fitBounds(place.geometry.viewport);
            } else {
                map.instance.setCenter(place.geometry.location);
                map.instance.setZoom(17);
            }

            self.search.set(place.formatted_address);

            /*
            console.log(place.geometry.location);
            console.log(place.place_id);
            console.log(place.formatted_address);
            */
        });

        // Initialize search bar for side menu
        var searchMenu = document.getElementById('location-search-menu');
        var autocompleteMenu = new google.maps.places.Autocomplete(searchMenu);

        autocompleteMenu.bindTo('bounds', map.instance);

        autocompleteMenu.addListener('place_changed', function () {
            var place = autocompleteMenu.getPlace();

            if (!place.geometry) {
                return;
            }

            if (place.geometry.viewport) {
                map.instance.fitBounds(place.geometry.viewport);
            } else {
                map.instance.setCenter(place.geometry.location);
                map.instance.setZoom(17);
            }

            self.search.set(place.formatted_address);

            /*
            console.log(place.geometry.location);
            console.log(place.place_id);
            console.log(place.formatted_address);
            */
        });
    });
});

Template.nav.helpers({
    getState: function() {
        return Template.instance().sideMenuState.get();
    },
    getCurrentSearch: function() {
        return Template.instance().search.get();
    }
});

Template.nav.events({
    'click #menu-btn' : function(e, template){
        var currentState = template.sideMenuState.get();
      
        if (currentState === 'in') {
            template.sideMenuState.set('out');
        } else {
            template.sideMenuState.set('in');
        }
    },
    'change input[name=location-search]': function(e, template) {
        template.search.set($(e.target).val());
    }
})
