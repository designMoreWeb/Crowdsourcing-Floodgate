Meteor.methods({
    timesTwo: function(num) {
        check(num, Number);

        return num * 2;
    }
});