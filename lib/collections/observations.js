/*
* JS MongoDB collection init and methods file
* Observations
*/

import {checkAccess} from "../../helpers/access";
import SimpleSchema from "simpl-schema";

Observations = new Mongo.Collection('observations');

Meteor.methods({
  observationInsert: function(observationAttributes) {
    console.log('obs attrs', observationAttributes);
    new SimpleSchema({
      name: String,
      observationDate: {
        type: String,
        regEx: /^\d{4}-\d{2}-\d{2}$/,
      },
      envId: String,
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
        custom: function() {
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
        custom: function() {
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

    if (observationAttributes.observationDate)

    var user = Meteor.user();
    console.log('before', observationAttributes);
    var observation = _.extend(observationAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      lastModified: new Date()
    });
    console.log('after', observation);

    var obsId = Observations.insert(observation);
    console.log('obsId', obsId);

    return {
      _id: obsId
    };
  },
  timerUpdate: function (obj) {
    checkAccess(obj.obsId, 'observation', 'edit');

    var obs = Observations.update({'_id': obj.obsId}, {$set: {'timer': obj.timer}});
    },
  observationModify: function(obj) {
    checkAccess(obj.obsId, 'observation', 'edit');

    Observations.update({'_id': obj.obsId}, {$set: {'lastModified': new Date()}});

    Meteor.call('environmentModifyObs', obj.envId, function(error, result) {
      return 0;
    });

  },

  observationRename: function(args) {
    checkAccess(args.obsId, 'observation', 'edit');

    return !!Observations.update({'_id': args.obsId}, {$set: {'lastModified': new Date(), 'name': args.obsName}});
  },

  observationUpdateDate: function(args) {
    checkAccess(args.obsId, 'observation', 'edit');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(args.observationDate)) {
      throw new Meteor.Error('422', 'invalid date input, must be in format yyyy-mm-dd')
    }
    return !!Observations.update({'_id': args.obsId}, {$set: {'lastModified': new Date(), 'observationDate': args.observationDate}});
  },

  observationDelete: function(obsId) {
    checkAccess(obsId, 'observation', 'delete');

    Observations.remove({
      _id: obsId
    })
    Sequences.remove({
      obsId: obsId
    })
  }
});
