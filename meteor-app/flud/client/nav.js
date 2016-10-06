Template.nav.onCreated(function(){
    this.sideMenuState = new ReactiveVar("in")
});

Template.nav.helpers({
    getState: function() {
        return Template.instance().sideMenuState.get();
    }
});

Template.nav.events({
    "click #menu-btn" : function(e, template){
        e.preventDefault();
        var currentState = template.sideMenuState.get();
        console.log();
        if(currentState === "in") {
            template.sideMenuState.set("out");
        } else {
            template.sideMenuState.set("in");
        }
    }
})
