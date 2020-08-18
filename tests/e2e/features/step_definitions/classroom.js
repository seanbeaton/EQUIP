// import {upgradeParams} from "../../../../helpers/migration_transforms";

const assert = require('assert');
import {console_log_conditional} from "../../../../helpers/logging";

var myStepDefinitionsWrapper = function () {
  this.Then(/^A classroom exists with the name "([^"]*)"$/, function (classroom, callback) {
    let env_found = browser.execute(function (classroom_name) {
      return (Environments.findOne({envName: classroom_name}) !== undefined);
    }, classroom);
    assert(env_found);
    callback()
  });

  this.Given(/^there is an empty classroom with the name "([^"]*)"$/, function (classroom, callback) {
    let env_found = browser.execute(function (classroom_name) {
      Meteor.call('environmentInsert', {
        envName: classroom_name,
      });
    }, classroom);
    callback()
  });

  this.Given(/^there is a classroom with the name "([^"]*)" with default parameters$/, function (classroom, callback) {
    let env_found = browser.executeAsync(function (classroom_name, cb) {
      let envId_res = Meteor.call('environmentInsert', {envName: classroom_name}, function (err, res) {
        if (err) {
          console_log_conditional('error', err);
          cb();
          return;
        }

        let envId = res._id;

        const default_demo_parameters = [
          {
            name: "Race",
            options: [
              "Asian",
              "Black",
              "Latinx",
              "Native",
              "White",
              "Mixed"
            ]
          },
          {
            name: "Gender",
            options: [
              "Boy",
              "Girl",
              "Nonbinary"
            ]
          }
        ];
        const default_seq_parameters = [
          {
            name: "Teacher Solicitation",
            options: ['How', 'What', 'Why', 'Other', 'None']
          },
          {
            name: "Wait Time",
            options: ["Less than 3 seconds", "3 or more seconds", "N/A"]
          },
          {
            name: "Solicitation Method",
            options: ["Called On", "Not Called On"]
          },
          {
            name: "Length of Talk",
            options: ["1-4 words", "5-20", "21 or more"]
          },
          {
            name: "Student Talk",
            options: ["How", "What", "Why", "Other"]
          }
        ];

        Meteor.call('updateSubjParameters', {parameters: default_demo_parameters, envId: envId});
        Meteor.call('updateSeqParameters', {parameters: default_seq_parameters, envId: envId});
        cb()
      });
    }, classroom);
    callback();
  });

  this.Given(/^there is a classroom with the name "([^"]*)" with default parameters and default students$/, function (classroom, callback) {
    let env_found = browser.executeAsync(function (classroom_name, cb) {
      let envId_res = Meteor.call('environmentInsert', {envName: classroom_name}, function (err, res) {
        if (err) {
          console_log_conditional('error', err);
          cb();
          return;
        }

        let envId = res._id;

        const default_demo_parameters = [
          {
            name: "Race",
            options: [
              "Asian",
              "Black",
              "Latinx",
              "Native",
              "White",
              "Mixed"
            ]
          },
          {
            name: "Gender",
            options: [
              "Boy",
              "Girl",
              "Nonbinary"
            ]
          }
        ];
        const default_seq_parameters = [
          {
            name: "Teacher Solicitation",
            options: ['How', 'What', 'Why', 'Other', 'None']
          },
          {
            name: "Wait Time",
            options: ["Less than 3 seconds", "3 or more seconds", "N/A"]
          },
          {
            name: "Solicitation Method",
            options: ["Called On", "Not Called On"]
          },
          {
            name: "Length of Talk",
            options: ["1-4 words", "5-20", "21 or more"]
          },
          {
            name: "Student Talk",
            options: ["How", "What", "Why", "Other"]
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

        Meteor.call('updateSubjParameters', {parameters: default_demo_parameters, envId: envId});
        Meteor.call('updateSeqParameters', {parameters: default_seq_parameters, envId: envId});
        default_students.forEach(function (subj) {
          Meteor.call('subjectInsert', subj);
        });
        cb()
      });
    }, classroom);
    callback();
  });
};

module.exports = myStepDefinitionsWrapper;
