/*
* JS MongoDB collection init and methods file
* SubjectParameters
*/

SubjectParameters = new Mongo.Collection('subject_parameters');

Meteor.methods({

  removeSubjParameters: function(obj) {
    SubjectParameters.remove({
      'children.envId': obj.envId
    });

    var user = Meteor.user();


    var subjParamsId = SubjectParameters.insert({userId: user._id, author: user.username, submitted: new Date(), children: {'envId': obj.envId, 'parameterPairs': 0}});

    Meteor.call('environmentModifyParam', obj.envId, function(error, result) {
      return 0;
    });

    return {
       _subjParamsId: subjParamsId
    };
  },

  exportSubjParameters: function(envId) {
    var subjParams = SubjectParameters.findOne({'children.envId': envId}) || null;

    if (subjParams == null) { return {}; }

    return subjParams['children'];

  },

  importSubjParameters: function(obj) {

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
