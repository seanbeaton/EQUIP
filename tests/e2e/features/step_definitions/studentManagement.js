const assert = require('assert');

var myStepDefinitionsWrapper = function () {
  this.When(/^I create a student named "([^"]*)" with the demographics "([^"]*)": "([^"]*)" and "([^"]*)": "([^"]*)"$/, function (name, demo1, demo1val, demo2, demo2val, callback) {
    let add_student_button = browser.$('#add-student');
    add_student_button.waitForExist(2000);
    add_student_button.click();

    let name_field = browser.$('.student-name-field');
    name_field.waitForExist(2000);
    name_field.setValue(name);

    let container1 = browser.$('.c--modal-student-options-container[data-parameter-name="' + demo1 + '"]');
    container1.$('.subj-box-params=' + demo1val).click();
    let container2 = browser.$('.c--modal-student-options-container[data-parameter-name="' + demo2 + '"]');
    container2.$('.subj-box-params=' + demo2val).click();

    browser.$('#save-subj-params').click();
    callback();
  });

  this.Then(/^a student named "([^"]*)" with the demographics "([^"]*)": "([^"]*)" and "([^"]*)": "([^"]*)"( does not | )exist[s]? on the student page$/, function (name, demo1, demo1val, demo2, demo2val, negation, callback) {
    negation = negation === ' does not ';

    let student_box = browser.$('.c--student-body__container-drag-label=' + name);
    student_box.waitForExist(2000);

    let res = browser.executeAsync(function(name, demo1, demo1val, demo2, demo2val, cb) {
      let student_search = {
        'info.name': name
      }
      student_search['info.demographics.' + demo1] = demo1val;
      student_search['info.demographics.' + demo2] = demo2val;
      let student_search_result = Subjects.findOne(student_search);
      cb(student_search_result);
      // return student_search_result;
    }, name, demo1, demo1val, demo2, demo2val);
    assert(negation !== (res && res.value && res.value._id));
    callback();
  });


  // this.When(/^a student named "([^"]*)" with the demographics "([^"]*)": "([^"]*)" and "([^"]*)": "([^"]*)"( does not | )already exist[s]?$/, function(name, demo1, demo1val, demo2, demo2val, negation, callback) {
  //   negation = negation === ' does not ';
  //
  //   let res = browser.executeAsync(function(name, demo1, demo1val, demo2, demo2val, cb) {
  //     let student_search = {
  //       'info.name': name
  //     }
  //     student_search['info.demographics.' + demo1] = demo1val;
  //     student_search['info.demographics.' + demo2] = demo2val;
  //     let student_search_result = Subjects.findOne(student_search);
  //     cb(student_search_result);
  //   }, name, demo1, demo1val, demo2, demo2val);
  //   assert(negation !== (res && res.value && res.value._id));
  //   callback();
  // });


  this.Then(/^a student named "([^"]*)" with the demographics "([^"]*)": "([^"]*)" and "([^"]*)": "([^"]*)"( does not | )exist[s]?$/, function(name, demo1, demo1val, demo2, demo2val, negation, callback) {
    negation = negation === ' does not ';

    let res = browser.executeAsync(function(name, demo1, demo1val, demo2, demo2val, cb) {
      let student_search = {
        'info.name': name
      }
      student_search['info.demographics.' + demo1] = demo1val;
      student_search['info.demographics.' + demo2] = demo2val;
      let student_search_result = Subjects.findOne(student_search);
      cb(student_search_result);
    }, name, demo1, demo1val, demo2, demo2val);
    assert(negation !== (res && res.value && res.value._id));
    callback();
  });

};

module.exports = myStepDefinitionsWrapper;