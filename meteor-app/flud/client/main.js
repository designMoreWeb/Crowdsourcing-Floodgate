Template.main.onRendered(function () {
    var self = this;

    // Intro.js for tutorial
    this.introJs = require('intro.js').introJs;

    // Register polyfills for all dialogs if necessary
    var dialogs = document.querySelectorAll('dialog');

    if (dialogs.length && !dialogs[0].showModal) {
        for (let dialog of dialogs) {
            dialogPolyfill.registerDialog(dialog);
        }
    }

    GoogleMaps.ready('fludMap', function (map) {

        //TODO - get sidepanel to open at start of tutorial because tutorial cycles through blank spaces where elements are on side panel
        if (!Session.get("visited")) {
            Session.set("visited", true);

            self.introJs().onchange(function(targetElement) { 
                switch (this._currentStep) {
                    case 2:
                        $('.mdl-layout__drawer-button').click();
                        break;
                    case 7:
                        $('.mdl-layout__drawer-button').click();
                        break;
                }
            }).start();      
        }

    });
});

Template.main.events({
    // Global close dialog handler
    'click .mdl-dialog__actions > .close': function (e) {
        document.querySelector('.mdl-dialog[open]').close();
    },
    'click .mdl-dialog[open]': function (e) {
        if (!$(e.target).closest('.dialog-inner').length) {
            document.querySelector('.mdl-dialog[open]').close();
        }
    },
});