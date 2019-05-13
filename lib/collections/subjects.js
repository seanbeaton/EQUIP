/*
* JS MongoDB collection init and methods file
* Subjects
*/

import {checkAccess} from "/helpers/access";
import SimpleSchema from "simpl-schema";
import {setupSubjectParameters} from "/helpers/parameters";

Subjects = new Mongo.Collection('subjects');


let getEnvStudentParamsSchema = function(envId) {
  let parameters = setupSubjectParameters(envId);
  let availableOptions = {
    info: Object,
    'info.demographics': Object,
  };
  parameters.forEach(function(param) {
    availableOptions['info.demographics.' + param.name] = {
      type: String,
      allowedValues: param.options.split(',').map(function(item) { return item.trim() }),
    }
  });

  // console.log('available iptions for envid', envId, availableOptions);

  return new SimpleSchema(availableOptions);
}


Meteor.methods({
  subjectInsert: function(subjectAttributes) {
    checkAccess(subjectAttributes.envId, 'environment', 'edit');
    let subject_schema = new SimpleSchema({
      envId: String,
      data_x: String,
      data_y: String,
      origStudId: {
        type: String,
        optional: true,
      },
      info: Object,
      'info.name': String,
      'info.demographics': Object
    })
    subject_schema.extend(getEnvStudentParamsSchema(subjectAttributes.envId));
    subject_schema.validate(subjectAttributes);

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
    checkAccess(sub.id, 'subject', 'edit');
    let subject_schema = new SimpleSchema({
      'id': String,
      info: Object,
      'info.name': String,
      'info.demographics': Object
    });
    subject_schema.extend(getEnvStudentParamsSchema(Subjects.findOne({_id:sub.id}).envId));
    subject_schema.validate(sub);

    Subjects.update({'_id': sub.id}, {$set: {'info': sub.info}});
  },
  subjectPositionUpdate: function(subjects) {
    let subj_pos_schema = new SimpleSchema({
      id: String,
      y: String,
      x: String,
    });
    subjects.forEach(function(subject) {
      checkAccess(subject.id, 'subject', 'edit');

      subj_pos_schema.validate(subject);
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
