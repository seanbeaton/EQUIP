/*
* JS MongoDB collection init and methods file
* Sequences
*/

Sequences = new Mongo.Collection('sequences');

Meteor.methods({
  sequenceInsert: function(seq) {
    var user = Meteor.user();

    var sequence = _.extend(seq, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    var sequenceId = Sequences.insert(sequence);

    var modifier = {obsId: seq.obsId, envId: seq.envId}
    Meteor.call('observationModify', modifier, function(error, result) {
      return 0;
    });

    return {
      _id: sequenceId
    };
  },
  sequenceUpdate: function (seq) {
    Sequences.update({'_id': seq.seqId}, {$set: {'info': seq.info}});
  },
  sequenceDelete: function(sequenceId) {
    Sequences.remove({
      _id: sequenceId
    })
  }
});
