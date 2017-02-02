Meteor.startup(() => {
    Meteor.subscribe('userData');
    
    sAlert.config({
        effect: 'flip',
        position: 'bottom-right',
        timeout: 5000,
        html: false,
        onRouteClose: true,
        stack: {
            spacing: 10, // in px
            limit: 3 // when fourth alert appears all previous ones are cleared
        },
        offset: 30, // in px - will be added to first alert (bottom or top - depends of the position in config)
        beep: false,
        onClose: _.noop
    });
});