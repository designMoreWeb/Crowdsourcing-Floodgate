import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
    // Cron job to archive old datapoints at fixed intervals
    /*
    SyncedCron.add({
        name: 'Archive old data points.',
        schedule: function (parser) {
            return parser.text('every 1 hour');
        },
        job: function () {
            var anHourAgo = new Date();
            anHourAgo.setHours(anHourAgo.getHours() - 1);

            var oldPoints = DataPoints.find({ createdAt: { $lte: anHourAgo.toISOString() } }).fetch();

            if (oldPoints.length) {
                DataPoints.remove({ createdAt: { $lte: anHourAgo.toISOString() } });
                DataPointsArchive.batchInsert(oldPoints);
            }
        }
    });

    SyncedCron.start();
    */
});
