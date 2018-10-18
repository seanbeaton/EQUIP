/*
* JS MongoDB collection init and methods file
* Observations
*/

Observations = new Mongo.Collection('observations');

Meteor.methods({
  observationInsert: function(observationAttributes) {

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

  observationDelete: function(obsId) {
    Observations.remove({
      _id: obsId
    })
    Sequences.remove({
      obsId: obsId
    })
  }
});
