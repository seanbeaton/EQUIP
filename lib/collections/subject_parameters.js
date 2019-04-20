/*
* JS MongoDB collection init and methods file
* SubjectParameters
*/

import {checkAccess} from "../../helpers/access";

SubjectParameters = new Mongo.Collection('subject_parameters');

Meteor.methods({

  exportSubjParameters: function(envId) {
    checkAccess(envId, 'environment', 'view');

    var subjParams = SubjectParameters.findOne({'children.envId': envId}) || null;

    if (subjParams == null) { return {}; }

    return subjParams['children'];

  },

  importSubjParameters: function(obj) {
    checkAccess(obj.envId, 'environment', 'edit');

    var user = Meteor.user();

    SubjectParameters.remove({
      'children.envId': obj.envId
    });

    var subjParamsId = SubjectParameters.insert({userId: user._id, author: user.username, submitted: new Date(), children: obj});

    Meteor.call('environmentModifyParam', obj.envId, function(error, result) {
      return 0;
    });

    return {
       _subjParamsId: subjParamsId
    };

  },

  updateSubjParameters: function(obj) {
    checkAccess(obj.envId, 'environment', 'edit');

    SubjectParameters.remove({
      'children.envId': obj.envId
    });

    var user = Meteor.user();


    var subjParamsId = SubjectParameters.insert({userId: user._id, author: user.username, submitted: new Date(), children: obj});

    Meteor.call('environmentModifyParam', obj.envId, function(error, result) {
      return 0;
    });

    return {
       _subjParamsId: subjParamsId
    };
  }
});
