/*
* JS MongoDB collection init and methods file
* Sequences
*/

import {checkAccess} from "/helpers/access";
import {console_log_conditional} from "/helpers/logging"
import {getStudent} from "../../helpers/students";

class Sequence {
  constructor(doc) {
    _.extend(this, doc);
    if (typeof this.info.student === "undefined") {
      return;
    }
    let _s = Subjects.findOne({_id: this.info.student.studentId})
    if (typeof _s === "undefined") {
      return;
    }
    this.info.student = {
      studentId: _s._id,
      studentName: _s.info.name,
      demographics: _s.info.demographics
    }
  }
}


Sequences = new Mongo.Collection('sequences', {
  transform: (doc) => new Sequence(doc)
});


Meteor.methods({
  sequenceInsert: function(seq) {
    //todo check for missing params on save
    console_log_conditional('sequenceInsert', 'before log access check');
    checkAccess(seq.envId, 'environment', 'edit');
    console_log_conditional('sequenceInsert', 'after log access check');

    var user = Meteor.user();

    var sequence = _.extend(seq, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    console_log_conditional('sequenceInsert', 'before insert');
    var sequenceId = Sequences.insert(sequence);
    console_log_conditional('sequenceInsert', 'after insert');


    var modifier = {obsId: seq.obsId, envId: seq.envId}
    console_log_conditional('sequenceInsert', 'before modify');
    // Meteor.call('observationModify', modifier);
    console_log_conditional('sequenceInsert', 'after modify');

    return {
      _id: sequenceId
    };
  },
  sequenceUpdate: function (seq) {
    checkAccess(seq.envId, 'environment', 'edit');

    //todo check format of the info here
    Sequences.update({'_id': seq.seqId}, {$set: {'info.parameters': seq.info.parameters}});
  },
  sequenceDelete: function(sequenceId) {
    checkAccess(sequenceId, 'sequence', 'delete');

    Sequences.remove({
      _id: sequenceId
    })
  }
});
