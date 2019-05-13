/*
* JS MongoDB collection init and methods file
* SharedEnvironments
*/


import {checkAccess} from "/helpers/access";

SharedEnvironments = new Mongo.Collection('shared_environments');

Meteor.methods({
  shareEnvironment: function(envId) {
    checkAccess(envId, 'environment', 'edit'); // edit, not view. don't want people to share things they can't edit.

    let envToShare = Environments.findOne({_id: envId});

    var user = Meteor.user();

    if (!user || !envToShare || user._id !== envToShare.userId) {
      throw new Meteor.Error('access_error', "You don't have permission to export that classroom")
    }

    var shareEnv = {
      authorUserId: user._id,
      authorName: user.username,
      submitted: new Date(),
      envName: envToShare.envName,
      origEnvId: envToShare._id,
      sequenceParameters: SequenceParameters.findOne({'children.envId': envId}),
      subjectParameters: SubjectParameters.findOne({'children.envId': envId}),
      shareStudents: false,
    };

    let ret_ids = {
      _id: '',
      _id_with_students: '',
    }

    let preexisting_env = SharedEnvironments.findOne({shareStudents: false, origEnvId: shareEnv.origEnvId, envName: shareEnv.envName, sequenceParameters: shareEnv.sequenceParameters, subjectParameters: shareEnv.subjectParameters})
    if (preexisting_env) {
      ret_ids._id = preexisting_env._id;
    } else {
      ret_ids._id = SharedEnvironments.insert(shareEnv);
    }

    shareEnv.shareStudents = true;
    shareEnv.students = Subjects.find({envId: envId}).fetch();

    let preexisting_stud_share_env = SharedEnvironments.findOne({shareStudents: true, students: shareEnv.students, origEnvId: shareEnv.origEnvId, envName: shareEnv.envName, sequenceParameters: shareEnv.sequenceParameters, subjectParameters: shareEnv.subjectParameters})
    if (preexisting_stud_share_env) {
      ret_ids._id_with_students = preexisting_stud_share_env._id;
    } else {
      ret_ids._id_with_students = SharedEnvironments.insert(shareEnv);
    }

    return ret_ids
  },
  getSharedEnvironment: function(shareId) {
    checkAccess(shareId, 'shared_environment', 'view');

    if (!shareId) {
      throw new Meteor.Error('missing_param', "You must specify a share id")
    }
    let shareEnv = SharedEnvironments.findOne({_id: shareId});
    if (!shareEnv) {
      throw new Meteor.Error('no_env', "No shared environment was found with that ID")
    }
    return shareEnv;
  }
});

