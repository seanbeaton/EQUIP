/*
* JS MongoDB collection init and methods file
* SequenceParameters
*/

import {checkAccess} from "/helpers/access";

SequenceParameters = new Mongo.Collection('sequence_parameters');

Meteor.methods({

  exportSeqParameters: function(envId) {
    checkAccess(envId, 'environment', 'view');

    var seqParams = SequenceParameters.findOne({'children.envId': envId}) || null;

    if (seqParams == null) { return {}; }

    return seqParams['children'];
  },

  importSeqParameters: function(obj) {
    checkAccess(obj.envId, 'environment', 'edit');

    var user = Meteor.user();

    SequenceParameters.remove({
      'children.envId': obj.envId
    })

    var seqParamsId = SequenceParameters.insert({userId: user._id, author: user.username, submitted: new Date(), children: obj});

    Meteor.call('environmentModifyParam', obj.envId, function(error, result) {
      return 0;
    });

    return {
       _seqParamsId: seqParamsId
    };

  },

  updateSeqParameters: function(obj) {
    checkAccess(obj.envId, 'environment', 'edit');

    SequenceParameters.remove({
      'children.envId': obj.envId
    })

    var user = Meteor.user();

    var seqParamsId = SequenceParameters.insert({userId: user._id, author: user.username, submitted: new Date(), children: obj});

    Meteor.call('environmentModifyParam', obj.envId, function(error, result) {
      return 0;
    });

    return {
       _seqParamsId: seqParamsId
    };
  }
});
