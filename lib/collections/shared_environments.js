/*
* JS MongoDB collection init and methods file
* SharedEnvironments
*/


SharedEnvironments = new Mongo.Collection('shared_environments');

Meteor.methods({
  shareEnvironment: function(envId) {
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
    };

    console.log(shareEnv);

    let preexisting_env = SharedEnvironments.findOne({origEnvId: shareEnv.origEnvId, envName: shareEnv.envName, sequenceParameters: shareEnv.sequenceParameters, subjectParameters: shareEnv.subjectParameters})
    if (preexisting_env) {
      console.log('return preexisting share  id', preexisting_env._id);
      return {
        _id: preexisting_env._id
      }
    }
    let shareId = SharedEnvironments.insert(shareEnv);
    console.log('shareid', shareId);
    return {
      _id: shareId
    };
  },
  getSharedEnvironment: function(shareId) {
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

