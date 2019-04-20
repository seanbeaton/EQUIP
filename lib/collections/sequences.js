/*
* JS MongoDB collection init and methods file
* Sequences
*/

import {checkAccess} from "../../helpers/access";

Sequences = new Mongo.Collection('sequences');

Meteor.methods({
  sequenceInsert: function(seq) {
    checkAccess(seq.envId, 'environment', 'edit');

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
    checkAccess(seq.envId, 'environment', 'edit');

    Sequences.update({'_id': seq.seqId}, {$set: {'info': seq.info}});
  },
  sequenceDelete: function(sequenceId) {
    checkAccess(sequenceId, 'sequence', 'delete');

    Sequences.remove({
      _id: sequenceId
    })
  }
});
