FlowRouter.route('/', {
    name: "home",
    triggersEnter: [],
    action: function(params, queryParams) {
        BlazeLayout.render('main', {
            content: "map_view"
        });
    }
});
