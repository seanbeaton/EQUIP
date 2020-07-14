import {console_log_conditional} from "/helpers/logging"
import {upgradeParams, upgradeSequence, upgradeSubject, downgradeParams, downgradeSequence} from "../helpers/migration_transforms";
import {import_data} from "../sample_data/all";
import {updateSequence} from "../helpers/sequences";

Meteor.startup(function () {
  Migrations.migrateTo('7');
});


Migrations.add({
  version: 1,
  name: 'Adds date field to all observations',
  up: function () {
    Observations.find().forEach(function (res) {
      console_log_conditional('res', res);
      if (typeof res.observationDate === 'undefined') {
        let subDate = new Date(Date.parse(res.submitted));
        console_log_conditional('subDate', subDate);

        function pad(number) {
          if (number < 10) {
            return '0' + number;
          }
          return number;
        }

        res.observationDate = subDate.getFullYear() + '-' +
          pad(subDate.getMonth() + 1) + '-' +
          pad(subDate.getDate());

        Observations.update({'_id': res._id}, {
          $set: {
            'lastModified': new Date(),
            'observationDate': res.observationDate
          }
        });
      }

    })
  },
});

Migrations.add({
  version: 2,
  name: 'Adds observation type field to all observations',
  up: function () {
    Observations.update({observationType: {$exists: false}}, {$set: {"observationType": 'whole_class'}}, {multi: true});
  },
});

Migrations.add({
  version: 3,
  name: 'Adds either the absent or small_group arrays to observations',
  up: function () {
    Observations.update({
      observationType: 'whole_class',
      absent: {$exists: false}
    }, {$set: {"absent": []}}, {multi: true});
    Observations.update({
      observationType: 'small_group',
      small_group: {$exists: false}
    }, {$set: {"small_group": []}}, {multi: true});
  },
});


Migrations.add({
  version: 4,
  name: 'Convert data_x and data_y to int',
  up: function () {
    Subjects.find().forEach(function (res) {
      Subjects.update({'_id': res._id}, {$set: {data_x: parseInt(res.data_x) || 0, data_y: parseInt(res.data_y) || 0}})
    });
  },
});

Migrations.add({
  version: 5,
  name: 'Update all parameters and students to use new format.',
  up: function () {


    let oldFormatSequenceParametersUpdated = 0;
    SequenceParameters.find().forEach(function (params) {
      params = upgradeParams(params);
      oldFormatSequenceParametersUpdated++;
      if (oldFormatSequenceParametersUpdated % 1000 === 0) {
        console.log('Updating Subject Parameters, ' + oldFormatSequenceParametersUpdated + ' completed so far...')
      }
      SequenceParameters.update({'_id': params._id}, {$set: params, $unset: {children: 1}});
    });
    console.log('Updated ' + oldFormatSequenceParametersUpdated + ' old format Sequence Parameters.');

    let oldFormatSubjectParametersUpdated = 0;
    SubjectParameters.find().forEach(function (params) {
      params = upgradeParams(params);
      oldFormatSubjectParametersUpdated++;
      if (oldFormatSubjectParametersUpdated % 1000 === 0) {
        console.log('Updating Subject Parameters, ' + oldFormatSubjectParametersUpdated + ' completed so far...')
      }
      SubjectParameters.update({'_id': params._id}, {$set: params, $unset: {children: 1}});
    });
    console.log('Updated ' + oldFormatSubjectParametersUpdated + ' old format Subject Parameters.');


    let oldFormatStudentsUpdated = 0;
    let subjEnvCache = {}
    let subjEnvMemoStats = {'new': 0, 'memo': 0}
    Subjects.find().forEach(function (subj) {
      if (typeof subj.envId === 'undefined') {
        Subjects.remove({'_id': subj._id});
        return;
      }
      subj = upgradeSubject(subj, subjEnvCache, subjEnvMemoStats)
      oldFormatStudentsUpdated++;
      if (oldFormatStudentsUpdated % 1000 === 0) {
        console.log('Updating subjects, ' + oldFormatStudentsUpdated + ' completed so far...')
      }
      Subjects.update({'_id': subj._id}, {$set: {info: subj.info}});
    });
    console.log('subjEnvMemoStats new', subjEnvMemoStats.new, 'memod', subjEnvMemoStats.memo)

    console.log('Updated ' + oldFormatStudentsUpdated + ' old format subjects.')

    console.log('Removing all Shared Environments')
    SharedEnvironments.remove({});
  },
  down: function () {
    Subjects.update({}, {$unset: {'info.demographics': 1}}, {multi: true})

    SequenceParameters.find().forEach(function (params) {
      params = downgradeParams(params)
      SequenceParameters.update({'_id': params._id}, {$set: params, $unset: {parameters: 1, envId: 1}})
    })
    SubjectParameters.find().forEach(function (params) {
      params = downgradeParams(params)
      SubjectParameters.update({'_id': params._id}, {$set: params, $unset: {parameters: 1, envId: 1}})
    })
  }
});

Migrations.add({
  version: 6,
  name: 'Update all sequences to use new format.',
  up: function () {
    let oldFormatSequencesUpdated = 0;
    let cachedEnvsParams = {};
    let cachedEnvsMemoStats = {'new': 0, 'memo': 0}
    let failure_reasons = {};

    Sequences.find().forEach(function (sequence) {
      sequence = upgradeSequence(sequence, cachedEnvsParams, cachedEnvsMemoStats);
      oldFormatSequencesUpdated++
      if (oldFormatSequencesUpdated % 1000 === 0) {
        console.log('Updating sequences, ' + oldFormatSequencesUpdated + ' completed so far...')
      }
      if (typeof sequence.info.delete_seq !== 'undefined') {
        console.log('deleting sequence for reason:', sequence.info.reason)
        console.log('sequence to be removed:', sequence)
        if (typeof failure_reasons[sequence.info.reason] === 'undefined') { failure_reasons[sequence.info.reason] = 0};
        failure_reasons[sequence.info.reason]++;

        Sequences.remove({'_id': sequence._id});
        return;
      }
      Sequences.update({'_id': sequence._id}, {$set: sequence});
    });
    console.log('cachedEnvsMemoStats new', cachedEnvsMemoStats.new, 'memod', cachedEnvsMemoStats.memo)
    console.log('Updated ' + oldFormatSequencesUpdated + ' old format Sequences.')
    console.log('Removed sequences for the following reasons')
    console.log(Object.keys(failure_reasons).map((k)=>k + ' #: ' + failure_reasons[k]).join('\n'))

  },
  down: function () {
    Sequences.find().forEach(function (sequence) {
      sequence = downgradeSequence(sequence);
      Sequences.update({'_id': sequence._id}, {$set: {'sequence.info': sequence.info}});
    });
  }
});

Migrations.add({
  version: 7,
  name: 'Add example classroom.',
  up: function () {
    let admin_user_id = Config.findOne({'label': 'admin_user_id'});
    if (!admin_user_id) {
      Config.insert({'label': 'admin_user_id', value: process.env.ADMIN_USER_ID});
      admin_user_id = process.env.ADMIN_USER_ID;
    }
    else {
      admin_user_id = admin_user_id.value
    }
    let admin_username;
    let admin_user = Meteor.users.findOne({_id: admin_user_id})
    if (!admin_user) {
      admin_username = 'admin';
    }
    else {
      admin_username = admin_user.username;
    }

    const env_params = {
      envName: 'Example Classroom',
      isExample: true,
      userId: admin_user_id,
      author: admin_username,
      submitted: new Date(),
      lastModifiedParam: new Date(),
      lastModifiedObs: new Date(),
      inputStyle: 'box'
    }

    let envId = Environments.insert(env_params);
    import {import_data} from '/sample_data/all';
    let data = JSON.parse(JSON.stringify(import_data));
    let subjParams = data.subjectParameters;
    let seqParams = data.sequenceParameters;

    subjParams.envId = envId;
    seqParams.envId = envId;

    subjParams = _.extend(subjParams, {
      userId: admin_user_id,
      author: admin_username,
      submitted: new Date(),
    });
    let subjParamsId = SubjectParameters.insert(subjParams);

    seqParams = _.extend(seqParams, {
      userId: admin_user_id,
      author: admin_username,
      submitted: new Date(),
    });
    let seqParamsId = SequenceParameters.insert(seqParams);

    let subject_mapping = {};
    data.subjects.forEach(function (subj) {
      subj.envId = envId;
      let subject = _.extend(subj, {
        userId: admin_user_id,
        author: admin_username,
        submitted: new Date()
      });
      subject.data_x = parseInt(subject.data_x);
      subject.data_y = parseInt(subject.data_y);
      subject_mapping[subj['origStudId']] = Subjects.insert(subject);
    });

    let allParams = SequenceParameters.findOne({envId: envId}).parameters;
    data.observations.forEach(function (obs) {
      obs.envId = envId;
      if (typeof obs.small_group !== 'undefined') {
        obs.small_group = obs.small_group.map(orig_stud_id => subject_mapping[orig_stud_id]);
      }

      let observation = _.extend(obs, {
        userId: admin_user_id,
        author: admin_username,
        notes: '',
        submitted: new Date(),
        lastModified: new Date()
      })

      const newObsId = Observations.insert(observation);
      let obsSequences = data.sequences.find(seq => seq.origObsId === obs.origObsId);
      obsSequences.sequences.forEach(function (sequence) {
        sequence.envId = envId;
        sequence.obsId = newObsId;
        if (typeof sequence.info.studentId === 'undefined') {
          sequence.info.student.studentId = subject_mapping[sequence.info.student.origStudId];
        }
        else {
          sequence.info.student = {
            studentId: subject_mapping[sequence.info.studentId]
          }
          delete sequence.info.studentId
        }
        // console.log('seq before', sequence)
        sequence = updateSequence(sequence, allParams);
        // console.log('seq after', sequence)
        sequence = _.extend(sequence, {
          userId: admin_user_id,
          author: admin_username,
          submitted: new Date()
        });
        let sequenceId = Sequences.insert(sequence);
      })
    });

    let gid = Groups.insert({
      groupName: 'Example Classroom',
      ownerId: admin_user_id,
      ownerName: admin_username,
      submitted: new Date(),
      lastModified: new Date(),
      showForAllUsers: true,
      environments: [{
        envId: envId,
        share_type: 'view',
        submitted: new Date(),
        lastModified: new Date()
      }],
      members: [{userId: admin_user_id, roles: ['admin']}],
    })
    Config.insert({label: 'example_classroom_gid', value: gid});
    Config.insert({label: 'example_classroom_envId', value: envId});

    // Meteor.users.find().forEach(function(user) {
    //   Groups.update({_id: gid}, {
    //     $addToSet: {
    //       members: {
    //         userId: user._id,
    //         roles: ['view_env'],
    //         submitted: new Date(),
    //         lastModified: new Date()
    //       }
    //     }
    //   })
    // })
  },
  down: function () {

    const example_classroom_gid = Config.findOne({label: 'example_classroom_gid'});
    const example_classroom_envId = Config.findOne({label: 'example_classroom_envId'});

    Environments.remove({
      _id: example_classroom_envId
    })
    Observations.remove({
      envId: example_classroom_envId
    })
    Sequences.remove({
      envId: example_classroom_envId
    })
    Subjects.remove({
      envId: example_classroom_envId
    })
    SubjectParameters.remove({
      envId: example_classroom_envId
    })
    SequenceParameters.remove({
      envId: example_classroom_envId
    })
    Groups.remove({
      _id: example_classroom_gid
    })

    Config.remove({label: 'example_classroom_gid'});
    Config.remove({label: 'example_classroom_envId'});
  }
});
