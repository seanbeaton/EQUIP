/*
* JS MongoDB collection init and methods file
* Observations
*/

Observations = new Mongo.Collection('observations');

Meteor.methods({
  observationInsert: function(observationAttributes) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(observationAttributes.observationDate)) {
      throw new Meteor.Error('422', 'invalid date input, must be in format yyyy-mm-dd')
    }

    if (observationAttributes.observationDate)

    var user = Meteor.user();
    var observation = _.extend(observationAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      lastModified: new Date()
    });


    var obsId = Observations.insert(observation);

    return {
      _id: obsId
    };
  },
  timerUpdate: function (obj) {
    var obs = Observations.update({'_id': obj.obsId}, {$set: {'timer': obj.timer}});
    },
  observationModify: function(obj) {
    Observations.update({'_id': obj.obsId}, {$set: {'lastModified': new Date()}});

    Meteor.call('environmentModifyObs', obj.envId, function(error, result) {
      return 0;
    });

  },

  observationRename: function(args) {
    console.log('obs rename');
    return !!Observations.update({'_id': args.obsId}, {$set: {'lastModified': new Date(), 'name': args.obsName}});
  },

  observationUpdateDate: function(args) {
    console.log('obs update date');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.observationDate)) {
      throw new Meteor.Error('422', 'invalid date input, must be in format yyyy-mm-dd')
    }
    return !!Observations.update({'_id': args.obsId}, {$set: {'lastModified': new Date(), 'observationDate': args.observationDate}});
  },

  observationDelete: function(obsId) {
    Observations.remove({
      _id: obsId
    })
    Sequences.remove({
      obsId: obsId
    })
  }
});
