import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './views/map_view.html';

Template.map_view.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.subscribe('datapoints');
    this.counter = new ReactiveVar(0);
});

Template.map_view.helpers({
    counter() {
        return Template.instance().counter.get();
    },
});

Template.map_view.events({
    'click button'(event, instance) {
        // increment the counter when button is clicked
        instance.counter.set(instance.counter.get() + 1);
    },
});
