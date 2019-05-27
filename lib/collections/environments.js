/*
* JS MongoDB collection init and methods file
* Environments
*/

import {checkAccess} from "/helpers/access";
import {data} from "../../sample_data/all";
import {getStudent, updateStudent} from "/helpers/students";
import {getSequence, updateSequence} from "/helpers/sequences";
import {setupSequenceParameters, setupSubjectParameters} from "/helpers/parameters";

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

    console.log('envId of created env', envId);

    import {data} from '/sample_data/all';
    let subjParams = data.subjectParameters;
    let seqParams = data.sequenceParameters;

    subjParams.envId = envId;
    Meteor.call('importSubjParameters', subjParams);

    seqParams.envId = envId;
    Meteor.call('importSeqParameters', seqParams);

    data.subjects.forEach(function (subj) {
      console.log('importing example subject', subj)
      subj.envId = envId;
      let sid = Meteor.call('subjectInsert', subj);
      console.log('created subject with id', sid._id)
    });

    let allParams = setupSequenceParameters(envId);
    data.observations.forEach(function (obs) {
      obs.envId = envId;
      if (typeof obs.small_group !== 'undefined') {
        console.log('orig obs.small_group', obs.small_group);
        console.log('all students in new env', Subjects.find({envId: envId}).fetch());
        obs.small_group = Subjects.find({origStudId: {$in: [...obs.small_group]}, envId: envId}).fetch().map(s => s._id)
        console.log('after obs.small_group', obs.small_group);
      }
      console.log('inserting obs', obs)
      Meteor.call('observationInsert', obs, function (error, result) {
        console.log('obs res', error, result);
        let newObsId = result._id;
        let obsSequences = data.sequences.find(seq => seq.origObsId === obs.origObsId);
        console.log('obsSequences', obsSequences)
        obsSequences.sequences.forEach(function (sequence) {
          sequence.envId = envId;
          sequence.obsId = newObsId;
          let newStud;
          if (typeof sequence.info.studentId === 'undefined') {
            newStud = Subjects.findOne({origStudId: sequence.info.student.origStudId, envId: envId})
            // console.log('newstud 1', newStud);
            sequence.info.student.studentId = newStud._id;
          }
          else {
            newStud = Subjects.findOne({origStudId: sequence.info.studentId, envId: envId})
            // console.log('newstud 2', newStud);
            sequence.info.studentId = newStud._id;
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
      'children.envId': envId
    })
    SequenceParameters.remove({
      'children.envId': envId
    })
  },

  environmentRename: function (args) {
    checkAccess(args.envId, 'environment', 'edit');

    return !!Environments.update({'_id': args.envId}, {$set: {'envName': args.envName}});
  },

  environmentDuplicate: function (args) {
    checkAccess(args.sourceEnvId, 'environment', 'view');

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

        result.envId = new_env._id;

        Meteor.call('updateSubjParameters', result, function (error, result) {
          if (error) {
            throw new Meteor.Error(error.error, error.reason)
          }
        })
      });

      Meteor.call('exportSeqParameters', args.sourceEnvId, function (error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }

        result.envId = new_env._id;

        Meteor.call('importSeqParameters', result, function (error, result) {
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

          Meteor.call('subjectInsert', subject, function (error, result) {
            if (error) {
              throw new Meteor.Error(error.error, error.reason)
            }
          });
        }
      }
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

      console.log(shared_env);
      shared_env.subjectParameters.envId = new_env._id;
      shared_env.subjectParameters.children.envId = new_env._id;

      Meteor.call('importSubjParameters', shared_env.subjectParameters.children, function (error, result) {
        if (error) {
          throw new Meteor.Error(error.error, error.reason)
        }
        else {
          console.log('sharing students check:', shared_env.shareStudents);
          if (shared_env.shareStudents) {
            console.log('sharing students passed, copying the following students:', shared_env.students);
            let students = shared_env.students;
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

              Meteor.call('subjectInsert', subject, function (error, result) {
                if (error) {
                  throw new Meteor.Error(error.error, error.reason)
                }
              });
            }
          }
        }
      });

      shared_env.sequenceParameters.envId = new_env._id;
      shared_env.sequenceParameters.children.envId = new_env._id;

      Meteor.call('importSeqParameters', shared_env.sequenceParameters.children, function (error, result) {
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

    var seqParams = SequenceParameters.findOne({'children.envId': envId}) || null;
    var subjParams = SubjectParameters.findOne({'children.envId': envId}) || null;

    if (seqParams == null && subjParams == null) {
      return {}
    }
    ;

    var allParams = {};
    if (seqParams != null) {
      allParams['sequence'] = seqParams['children'];
    }
    if (subjParams != null) {
      allParams['subject'] = subjParams['children'];
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
