import {console_log_conditional} from "/helpers/logging"
import {upgradeParams, upgradeSequence, upgradeSubject, downgradeParams, downgradeSequence} from "../helpers/migration_transforms";

Meteor.startup(function () {
  Migrations.migrateTo('5');
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
      SequenceParameters.update({'_id': params._id}, {$set: params, $unset: {children: 1}});
    });
    console.log('Updated ' + oldFormatSequenceParametersUpdated + ' old format Sequence Parameters.');

    let oldFormatSubjectParametersUpdated = 0;
    SubjectParameters.find().forEach(function (params) {
      params = upgradeParams(params);
      oldFormatSubjectParametersUpdated++;
      SubjectParameters.update({'_id': params._id}, {$set: params, $unset: {children: 1}});
    });
    console.log('Updated ' + oldFormatSubjectParametersUpdated + ' old format Subject Parameters.');


    let oldFormatStudentsUpdated = 0;
    Subjects.find().forEach(function (subj) {
      if (typeof subj.envId === 'undefined') {
        Subjects.remove({'_id': subj._id});
        return;
      }
      subj = upgradeSubject(subj)
      oldFormatStudentsUpdated++;
      Subjects.update({'_id': subj._id}, {$set: {info: subj.info}});
    });
    console.log('Updated ' + oldFormatStudentsUpdated + ' old format subjects.')
    console.log('Removed ' + studentsWithoutEnv + ' stranded subjects without envids.')


    let oldFormatSequencesUpdated = 0;
    Sequences.find().forEach(function (sequence) {
      sequence = upgradeSequence(sequence);
      oldFormatSequencesUpdated++
      Sequences.update({'_id': sequence._id}, {$set: sequence});
    });
    console.log('Updated ' + oldFormatSequencesUpdated + ' old format Sequences.')
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

    Sequences.find().forEach(function (sequence) {
      sequence = downgradeSequence(sequence);
      Sequences.update({'_id': sequence._id}, {$set: {'sequence.info': sequence.info}});
    });
  }
});
