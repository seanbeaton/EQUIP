/*
* JS MongoDB collection init and methods file
* Environments
*/

Environments = new Mongo.Collection('environments');

Meteor.methods({


  environmentInsert: function(postAttributes) {

    var user = Meteor.user();
    var environment = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date(),
      lastModifiedParam: new Date(),
      lastModifiedObs: new Date(),
      inputStyle: 'box'
    });

    var envId = Environments.insert(environment);

    return {
      _id: envId
    };
  },
  environmentDelete: function(envId) {
    Environments.remove({
      _id: envId
    })
    Observations.remove({
      envId: envId
    })
    Sequences.remove({
      envId: envId
    })
    Subjects.remove({
      envId: envId
    })
    SubjectParameters.remove({
      'children.envId': envId
    })
    SequenceParameters.remove({
      'children.envId': envId
    })
  },

  environmentRename: function(args) {
    return !!Environments.update({'_id': args.envId}, {$set: {'envName': args.envName}});
  },

  environmentDuplicate: function(args) {
    // if (args.import_students && !args.import_parameters) {
    //   throw new Meteor.Error('duplicate_error', 'You cannot import students without importing parameters.')
    // }

    const env_values = {
      envName: args.envName
    };
    Meteor.call('environmentInsert', env_values, function(error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
      const new_env = result;

      Meteor.call('exportSubjParameters', args.sourceEnvId, function(error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }

        result.envId = new_env._id;

        Meteor.call('updateSubjParameters', result, function(error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }
        })
      });

      Meteor.call('exportSeqParameters', args.sourceEnvId, function(error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }

        result.envId = new_env._id;

        Meteor.call('importSeqParameters', result, function(error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }
        })
      });

      if (args.import_students) {
        let students = Subjects.find({envId: args.sourceEnvId}).fetch();
        for (let s_index in students) {
          if (!students.hasOwnProperty(s_index)) {
            continue
          }
          const student = students[s_index];

          const subject = {
            data_x: student.data_x,
            data_y: student.data_y,
            envId: new_env._id,
            info: student.info
          };

          Meteor.call('subjectInsert', subject, function(error, result) {
            if (error) {
              throw new Meteor.Error(error.error, error.reason)
            }
          });
        }
      }
    });
  },

  exportAllParams: function(envId) {
    var seqParams = SequenceParameters.findOne({'children.envId': envId}) || null;
    var subjParams = SubjectParameters.findOne({'children.envId': envId}) || null;

    if (seqParams == null && subjParams == null) { return {} };

    var allParams = {};
    if (seqParams != null){
      allParams['sequence'] = seqParams['children'];
    }
    if (subjParams != null) {
      allParams['subject'] = subjParams['children'];
    }

    return allParams;

  },

  environmentModifyParam: function(envId) {
    var env = Environments.update({'_id': envId}, {$set: {'lastModifiedParam': new Date()}});
  },

  environmentModifyObs: function(envId) {
    var env = Environments.update({'_id': envId}, {$set: {'lastModifiedObs': new Date()}});
  },

  updateInputStyle: function(obj) {
    var env = Environments.update({'_id':obj.envId}, {$set: {'inputStyle':obj.inputStyle}});
  }
});
