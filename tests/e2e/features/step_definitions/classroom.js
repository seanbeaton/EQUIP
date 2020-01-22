const assert = require('assert');

var myStepDefinitionsWrapper = function () {
  this.Then(/^A classroom exists with the name "([^"]*)"$/, function (classroom, callback) {
    let env_found = browser.execute(function(classroom_name) {
      return (Environments.findOne({envName: classroom_name}) !== undefined);
    }, classroom);
    assert(env_found);
    callback()
  });

  this.Given(/^there is an empty classroom with the name "([^"]*)"$/, function (classroom, callback) {
    let env_found = browser.execute(function(classroom_name) {
      Meteor.call('environmentInsert',  {
        envName: classroom_name,
      });
    }, classroom);
    callback()
  });

  this.Given(/^there is a classroom with the name "([^"]*)" with default parameters$/, function (classroom, callback) {
    let env_found = browser.executeAsync(function(classroom_name, cb) {
      let envId_res = Meteor.call('environmentInsert',  {envName: classroom_name}, function (err, res) {
        if (err) {
          console.log('error', err);
          cb();
          return;
        }

        let envId = res._id;

        const default_demo_parameters = [
          {
            name: "Race",
            input: "Asian, Black, Latinx, Native, White, Mixed Race"
          },
          {
            name: "Gender",
            input: "Girl, Boy, Nonbinary"
          }
        ];
        const default_seq_parameters = [
          {
            name: "Teacher Solicitation",
            input: "How,What,Why,Other,None"
          },
          {
            name: "Wait Time",
            input: "Less than 3 seconds,3 or more seconds,N/A"
          },
          {
            name: "Solicitation Method",
            input: "Called On,Not Called On"
          },
          {
            name: "Length of Talk",
            input: "1-4 words,5-20,21 or more"
          },
          {
            name: "Student Talk",
            input: "How,What,Why,Other"
          }
        ];
        // demo params
        let subj_params = {};
        let demoParamCount = 0;
        default_demo_parameters.forEach(function(param_set, idx) {
          subj_params['label' + idx] = param_set['name'];
          subj_params['parameter' + idx] = param_set['input'];
          demoParamCount++
        });

        subj_params['envId'] = envId;
        subj_params['parameterPairs'] = demoParamCount;

        // seq params
        let seq_params = {};
        let seqParamCount = 0;
        default_seq_parameters.forEach(function(param_set, idx) {
          seq_params['label' + idx] = param_set['name'];
          seq_params['parameter' + idx] = param_set['input'];
          seqParamCount++
        });

        seq_params['envId'] = envId;
        seq_params['parameterPairs'] = seqParamCount;

        Meteor.call('updateSubjParameters', subj_params);
        Meteor.call('updateSeqParameters', seq_params);
        cb()
      });
    }, classroom);
    callback();
  });

  this.Given(/^there is a classroom with the name "([^"]*)" with default parameters and default students$/, function (classroom, callback) {
    let env_found = browser.executeAsync(function(classroom_name, cb) {
      let envId_res = Meteor.call('environmentInsert',  {envName: classroom_name}, function (err, res) {
        if (err) {
          console.log('error', err);
          cb();
          return;
        }

        let envId = res._id;

        const default_demo_parameters = [
          {
            name: "Race",
            input: "Asian, Black, Latinx, Native, White, Mixed Race"
          },
          {
            name: "Gender",
            input: "Girl, Boy, Nonbinary"
          }
        ];
        const default_seq_parameters = [
          {
            name: "Teacher Solicitation",
            input: "How,What,Why,Other,None"
          },
          {
            name: "Wait Time",
            input: "Less than 3 seconds,3 or more seconds,N/A"
          },
          {
            name: "Solicitation Method",
            input: "Called On,Not Called On"
          },
          {
            name: "Length of Talk",
            input: "1-4 words,5-20,21 or more"
          },
          {
            name: "Student Talk",
            input: "How,What,Why,Other"
          }
        ];

        //   students_info.push({
        //     _id: $row.attr('data-student-id'),
        //     status: $row.attr('data-row-status'),
        //     deleted: ($row.attr('data-deleted') === 'true'),
        //     data_x:  $row.attr('data-x'),
        //     data_y: $row.attr('data-y'),
        //     envId: envId,
        //     info: {
        //       name: $row.find('input[data-field="name"][data-field-type="base"]').val(),
        //       demographics: demos
        //     }
        //   })
        // });
        //   let new_student = {
        //     envId: student.envId,
        //     data_x: String(student.data_x),
        //     data_y: String(student.data_y),
        //     info: student.info
        //   };

        const default_students = [
          {
            envId: envId,
            data_x: '0',
            data_y: '0',
            info: {
              name: 'Jim',
              demographics: {
                Race: "White",
                Gender: "Boy",
              }
            }
          },
          {
            envId: envId,
            data_x: '45',
            data_y: '0',
            info: {
              name: 'Han',
              demographics: {
                Race: "Asian",
                Gender: "Girl",
              }
            }
          },
          {
            envId: envId,
            data_x: '90',
            data_y: '0',
            info: {
              name: 'Shauna',
              demographics: {
                Race: "Black",
                Gender: "Girl",
              }
            }
          },
        ];
        // demo params
        let subj_params = {};
        let demoParamCount = 0;
        default_demo_parameters.forEach(function(param_set, idx) {
          subj_params['label' + idx] = param_set['name'];
          subj_params['parameter' + idx] = param_set['input'];
          demoParamCount++
        });

        subj_params['envId'] = envId;
        subj_params['parameterPairs'] = demoParamCount;

        // seq params
        let seq_params = {};
        let seqParamCount = 0;
        default_seq_parameters.forEach(function(param_set, idx) {
          seq_params['label' + idx] = param_set['name'];
          seq_params['parameter' + idx] = param_set['input'];
          seqParamCount++
        });

        seq_params['envId'] = envId;
        seq_params['parameterPairs'] = seqParamCount;

        Meteor.call('updateSubjParameters',   subj_params);
        Meteor.call('updateSeqParameters', seq_params);
        default_students.forEach(function(subj) {
          Meteor.call('subjectInsert', subj);
        });
        cb()
      });
    }, classroom);
    callback();
  });
};

module.exports = myStepDefinitionsWrapper;