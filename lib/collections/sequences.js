/*
* JS MongoDB collection init and methods file
* Sequences
*/

import {checkAccess} from "/helpers/access";

Sequences = new Mongo.Collection('sequences');

Meteor.methods({
  sequenceInsert: function(seq) {
    console.log('sequenceInsert', 'before log access check');
    checkAccess(seq.envId, 'environment', 'edit');
    console.log('sequenceInsert', 'after log access check');

    var user = Meteor.user();

    var sequence = _.extend(seq, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    console.log('sequenceInsert', 'before insert');
    var sequenceId = Sequences.insert(sequence);
    console.log('sequenceInsert', 'after insert');


    var modifier = {obsId: seq.obsId, envId: seq.envId}
    console.log('sequenceInsert', 'before modify');
    // Meteor.call('observationModify', modifier);
    console.log('sequenceInsert', 'after modify');

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
