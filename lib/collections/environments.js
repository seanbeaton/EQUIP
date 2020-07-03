/*
* JS MongoDB collection init and methods file
* Environments
*/
import {console_log_conditional} from "/helpers/logging"
import {checkAccess} from "/helpers/access";

Environments = new Mongo.Collection('environments');

Meteor.methods({

  environmentInsert: function (postAttributes) {
    // no checkAccess() for insert

    var environment = _.extend(postAttributes, {
      userId: Meteor.userId(),
      author: Meteor.user().name,
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

  environmentInsertExample: function () {
    // no checkAccess() for insert

    let envId = Meteor.call('environmentInsert', {
      envName: 'Example Classroom',
      isExample: true
    })._id;

    // let param_update = function(params) {
    //   let allParams = [];
    //   for (let p = 0; p < params["parameterPairs"]; p++) {
    //     allParams.push({
    //       'name': params['label'+p],
    //       'options': params['parameter'+p],
    //     });
    //   }
    //   return allParams;
    // }

    console_log_conditional('envId of created env', envId);

    import {import_data} from '/sample_data/all';

    let data = JSON.parse(JSON.stringify(import_data));
    // console_log_conditional('data', data)
    let subjParams = data.subjectParameters;
    let seqParams = data.sequenceParameters;

    subjParams.envId = envId;
    Meteor.call('importSubjParameters', subjParams);

    seqParams.envId = envId;
    Meteor.call('importSeqParameters', seqParams);

    let subject_mapping = {};
    data.subjects.forEach(function (subj) {
      console_log_conditional('importing example subject', subj)
      subj.envId = envId;
      let sid = Meteor.call('subjectInsert', subj);
      subject_mapping[subj['origStudId']] = sid._id;
      console_log_conditional('created subject with id', sid._id)
    });

    console_log_conditional('STUDENT MAPPING', subject_mapping);

    let allParams = SequenceParameters.findOne({envId: envId}).parameters;
    data.observations.forEach(function (obs) {
      obs.envId = envId;
      console_log_conditional('OBSERVATION', obs);
      if (typeof obs.small_group !== 'undefined') {
        console_log_conditional('orig obs.small_group', obs.small_group);
        console_log_conditional('all students in new env', Subjects.find({envId: envId}).fetch());
        obs.small_group = obs.small_group.map(orig_stud_id => subject_mapping[orig_stud_id]);
        console_log_conditional('after obs.small_group', obs.small_group);
      }
      console_log_conditional('inserting obs', obs)
      Meteor.call('observationInsert', obs, function (error, result) {
        let newObsId = result._id;
        let obsSequences = data.sequences.find(seq => seq.origObsId === obs.origObsId);
        console_log_conditional('obsSequences', obsSequences)
        obsSequences.sequences.forEach(function (sequence) {
          sequence.envId = envId;
          sequence.obsId = newObsId;
          let newStud;
          if (typeof sequence.info.studentId === 'undefined') {
            sequence.info.student.studentId = subject_mapping[sequence.info.student.origStudId];
          }
          else {
            sequence.info.studentId = subject_mapping[sequence.info.studentId];
          }
          sequence = updateSequence(sequence, allParams);

          Meteor.call('sequenceInsert', sequence, function (err, ret) {
            return 0;
          })
        })
      })
    });

    return {
      _id: envId
    };
  },

  environmentDelete: function (envId) {
    checkAccess(envId, 'environment', 'delete');

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
      envId: envId
    })
    SequenceParameters.remove({
      envId: envId
    })
  },

  environmentRename: function (args) {
    checkAccess(args.envId, 'environment', 'edit');

    return !!Environments.update({'_id': args.envId}, {$set: {'envName': args.envName}});
  },

  environmentDuplicate: function (args) {
    checkAccess(args.sourceEnvId, 'environment', 'view');
    //todo add input validation

    // if (args.import_students && !args.import_parameters) {
    //   throw new Meteor.Error('duplicate_error', 'You cannot import students without importing parameters.')
    // }

    const env_values = {
      envName: args.envName
    };
    Meteor.call('environmentInsert', env_values, function (error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
      const new_env = result;

      Meteor.call('exportSubjParameters', args.sourceEnvId, function (error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }
        Meteor.call('importSubjParameters', {parameters: result.parameters, envId: new_env._id}, function (error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }

          if (args.import_students) {
            let students = Subjects.find({envId: args.sourceEnvId}).fetch();
            for (let s_index in students) {
              if (!students.hasOwnProperty(s_index)) {
                continue
              }
              const student = students[s_index];

              const subject = {
                data_x: student.data_x.toString(),
                data_y: student.data_y.toString(),
                envId: new_env._id,
                info: student.info
              };

              Meteor.call('subjectInsert', subject, function (error, result) {
                if (error) {
                  throw new Meteor.Error(error.error, error.reason)
                }
              });
            }
          }

        })
      });

      Meteor.call('exportSeqParameters', args.sourceEnvId, function (error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }


        Meteor.call('importSeqParameters', {parameters: result.parameters, envId: new_env._id}, function (error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }
        })
      });
    });
  },

  environmentImportShared: function (shareId) {
    checkAccess(shareId, 'shared_environment', 'view');

    let shared_env = SharedEnvironments.findOne({_id: shareId});

    const env_values = {
      envName: shared_env.envName
    };
    let envId = Meteor.call('environmentInsert', env_values, function (error, result) {
      if (error) {
        throw new Meteor.Error(error.error, error.reason)
      }
      const new_env = result;

      console_log_conditional(shared_env);

      Meteor.call('importSubjParameters', {parameters: shared_env.subjectParameters.parameters, envId: new_env._id}, function (error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }
        else {
          console_log_conditional('sharing students check:', shared_env.shareStudents);
          if (shared_env.shareStudents) {
            console_log_conditional('sharing students passed, copying the following students:', shared_env.students);
            let students = shared_env.students;
            for (let s_index in students) {
              if (!students.hasOwnProperty(s_index)) {
                continue
              }
              const student = students[s_index];

              const subject = {
                data_x: student.data_x.toString(),
                data_y: student.data_y.toString(),
                envId: new_env._id,
                info: student.info
              };

              Meteor.call('subjectInsert', subject, function (error, result) {
                if (error) {
                  throw new Meteor.Error(error.error, error.reason)
                }
              });
            }
          }
        }
      });

      Meteor.call('importSeqParameters', {parameters: shared_env.sequenceParameters.parameters, envId: new_env._id}, function (error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }
      });

      return new_env._id
    });
    return {
      _id: envId,
    }
  },

  exportAllParams: function (envId) {
    checkAccess(envId, 'environment', 'view');

    var seqParams = SequenceParameters.findOne({'envId': envId}) || null;
    var subjParams = SubjectParameters.findOne({'envId': envId}) || null;

    if (seqParams == null && subjParams == null) {
      return {}
    }

    var allParams = {};
    if (seqParams != null) {
      allParams['sequence'] = seqParams['parameters'];
    }
    if (subjParams != null) {
      allParams['subject'] = subjParams['parameters'];
    }

    return allParams;
  },

  environmentModifyParam: function (envId) {
    checkAccess(envId, 'environment', 'edit');

    var env = Environments.update({'_id': envId}, {$set: {'lastModifiedParam': new Date()}});
  },

  environmentModifyObs: function (envId) {
    checkAccess(envId, 'environment', 'edit');

    var env = Environments.update({'_id': envId}, {$set: {'lastModifiedObs': new Date()}});
  },

  updateInputStyle: function (obj) {
    checkAccess(envId, 'environment', 'edit');

    var env = Environments.update({'_id': obj.envId}, {$set: {'inputStyle': obj.inputStyle}});
  }
});
