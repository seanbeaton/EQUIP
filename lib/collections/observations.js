/*
* JS MongoDB collection init and methods file
* Observations
*/

import {checkAccess} from "/helpers/access";
import SimpleSchema from "simpl-schema";
import {console_log_conditional} from "/helpers/logging"

Observations = new Mongo.Collection('observations');

Meteor.methods({
  observationInsert: function (observationAttributes) {
    console_log_conditional('obs attrs', observationAttributes);
    new SimpleSchema({
      name: String,
      description: {
        type: String,
        max: 280,
      },
      observationDate: {
        type: String,
        regEx: /^\d{4}-\d{2}-\d{2}$/,
      },
      envId: String,
      origObsId: {
        type: String,
        required: false,
      },
      observationType: {
        type: String,
        allowedValues: [
          'whole_class',
          'small_group'
        ]
      },
      small_group: {
        optional: true,
        type: Array,
        custom: function () {
          if (this.field('observationType').value === 'small_group') {
            if (!this.isSet || this.value === null || this.value === [] || this.value.length <= 1) {
              return SimpleSchema.ErrorTypes.REQUIRED;
            }
          }
        },
      },
      'small_group.$': String,
      absent: {
        optional: true,
        type: Array,
        custom: function () {
          if (this.field('observationType').value === 'whole_class') {
            if (!this.isSet || this.value === null) {
              // required on whole class, but can be an empty array.
              return SimpleSchema.ErrorTypes.REQUIRED;
            }
          }
        },
      },
      'absent.$': String,
      timer: Number
    }).validate(observationAttributes);
    checkAccess(observationAttributes.envId, 'environment', 'edit');
    // no checkAccess()  for insert

    var user = Meteor.user();
    console_log_conditional('before', observationAttributes);
    var observation = _.extend(observationAttributes, {
      userId: user._id,
      author: user.username,
      notes: '',
      submitted: new Date(),
      lastModified: new Date()
    });
    console_log_conditional('after', observation);

    var obsId = Observations.insert(observation);
    console_log_conditional('obsId', obsId);

    return {
      _id: obsId
    };
  },
  observationModify: function (obj) {
    console_log_conditional('observationModify', 'before access check');
    checkAccess(obj.obsId, 'observation', 'edit');
    console_log_conditional('observationModify', 'after access check');
    console_log_conditional('observationModify', 'before update');
    Observations.update({'_id': obj.obsId}, {$set: {'lastModified': new Date()}});
    console_log_conditional('observationModify', 'after update');

    Meteor.call('environmentModifyObs', obj.envId);
  },

  observationRename: function (args) {
    checkAccess(args.obsId, 'observation', 'edit');

    return !!Observations.update({'_id': args.obsId}, {$set: {'lastModified': new Date(), 'name': args.obsName}});
  },

  observationUpdateDate: function (args) {
    checkAccess(args.obsId, 'observation', 'edit');
    new SimpleSchema({
      observationDate: {
        type: String,
        regEx: /^\d{4}-\d{2}-\d{2}$/,
      },
      obsId: String,
    }).validate(args);


    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.observationDate)) {
      throw new Meteor.Error('422', 'invalid date input, must be in format yyyy-mm-dd')
    }
    return !!Observations.update({'_id': args.obsId}, {
      $set: {
        'lastModified': new Date(),
        'observationDate': args.observationDate
      }
    });
  },
  observationUpdateDescription: function (args) {
    checkAccess(args.obsId, 'observation', 'edit');
    new SimpleSchema({
      description: {
        type: String,
        max: 280,
      },
      obsId: String,
    }).validate(args);

    return !!Observations.update({'_id': args.obsId}, {
      $set: {
        'lastModified': new Date(),
        'description': args.description
      }
    });
  },
  observationUpdateNotes: function (args) {
    checkAccess(args.obsId, 'observation', 'edit');
    new SimpleSchema({
      notes: String,
      obsId: String,
    }).validate(args);

    return !!Observations.update({'_id': args.obsId}, {
      $set: {
        'lastModified': new Date(),
        'notes': args.notes
      }
    });
  },
  observationModifyAbsentStudent: function (args) {
    new SimpleSchema({
      obsId: String,
      action: {
        type: String,
        allowedValues: ['mark', 'unmark']
      },
      studentId: String,
    }).validate(args);
    checkAccess(args.obsId, 'observation', 'edit');

    let obs = Observations.findOne({_id: args.obsId});
    if (obs.observationType !== 'whole_class') {
      throw new Meteor.Error('422', `Can't set absent students on observations that aren't of type whole_class`);
    }

    let student_currently_absent = !!obs.absent.find(sid => sid === args.studentId)
    if (student_currently_absent && args.action === 'mark') {
      throw new Meteor.Error('422', `Student with id ${args.studentId} is already marked as absent, cannot mark as absent.`);
    }
    if (!student_currently_absent && args.action === 'unmark') {
      throw new Meteor.Error('422', `Student with id ${args.studentId} is not already marked as absent, cannot un-mark as absent.`);
    }

    if (args.action === 'mark') {
      return !!Observations.update({'_id': args.obsId}, {
        $set: {'lastModified': new Date(),},
        $push: {absent: args.studentId}
      });
    }
    else if (args.action === 'unmark') {
      return !!Observations.update({'_id': args.obsId}, {
        $set: {'lastModified': new Date(),},
        $pull: {absent: args.studentId}
      });
    }
  },

  observationDelete: function (obsId) {
    checkAccess(obsId, 'observation', 'delete');

    Observations.remove({
      _id: obsId
    })
    Sequences.remove({
      obsId: obsId
    })
  }
});
