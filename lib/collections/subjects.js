/*
* JS MongoDB collection init and methods file
* Subjects
*/

import {checkAccess} from "../../helpers/access";

Subjects = new Mongo.Collection('subjects');

Meteor.methods({
  subjectInsert: function(subjectAttributes) {
    checkAccess(subjectAttributes.envId, 'environment', 'edit');

    var user = Meteor.user();

    var subject = _.extend(subjectAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });

    var subjId = Subjects.insert(subject);

    return {
      _id: subjId
    };
  },
  subjectUpdate: function (sub) {
    checkAccess(sub.subId, 'subject', 'edit');

    Subjects.update({'_id': sub.subId}, {$set: {'info': sub.info}});
  },
  subjectPositionUpdate: function(subjects) {
    subjects.forEach(function(subject) {
      checkAccess(subject.id, 'subject', 'edit');
      Subjects.update(subject.id, {$set: { 'data_x': subject.x, 'data_y': subject.y}});
    });
  },
  subjectDelete: function(subjId) {
    checkAccess(subjId, 'subject', 'delete');

    Subjects.remove({
      _id: subjId
    })
    Sequences.remove({
      subjId: subjId
    })
  },
});
