const assert = require('assert');
var {Then} = require('cucumber');

var myStepDefinitionsWrapper = function () {
  this.Given(/^I am on the staging site$/, function(callback) {
    browser.url('https://data-obs-staging.herokuapp.com/');
    callback()
  });

  this.When(/^If I'm not logged in, I create an account with username prefix "([^"]*)" and password "([^"]*)"$/, function(user, pass, callback) {

    let current_user = browser.executeAsync((done) => {done(Meteor.userId())});
    console.log(current_user);
    if (!current_user.value) {
      console.log('Not logged in, creating account')
      createAccount(user, pass)
    }
    callback()
  });

  this.Then(/^A classroom exists with the name "([^"]*)"$/, function (classroom, callback) {
    let env_found = browser.execute(function(classroom_name) {
      return (Environments.findOne({envName: classroom_name}) !== undefined);
    }, classroom);
    assert(env_found);
    callback()
  });
  this.When(/^I pause like a human$/, function (callback) {
    browser.pause(10000);
    callback()
  });
  this.When(/^I quickly pause like a human$/, function (callback) {
    browser.pause(5000);
    callback()
  });
  this.When(/^I really quickly pause like a human$/, function (callback) {
    browser.pause(1500);
    callback()
  });
  this.When(/^I slowly pause like a human$/, function (callback) {
    browser.pause(15000);
    callback()
  });

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

};


let createAccount = function(username, password) {
  delayedGo('signup');
  browser.$('#at-field-username').waitForExist(4000);
  username = username + ("" + Math.floor(Math.random() * Math.floor(99999))).padStart(5, '0');
  browser.$('#at-field-username').setValue(username);
  browser.$('#at-field-email').setValue(username + '@example.com');
  console.log('Creating account with name username:', username);
  browser.$('#at-field-password').setValue(password);
  browser.$('#at-field-password_again').setValue(password);
  browser.$('#at-field-institution').setValue("Institution test");
  browser.$('#at-field-role').setValue("Role test");
  browser.$('#at-field-intended_use').setValue("Intended use test");
  browser.$('#at-field-how_did_you_hear').setValue("How did you hear test");
  browser.pause(250);
  browser.$('#at-btn').waitForExist(5000);
  browser.$('#at-btn').click();
  browser.$('#at-btn').click();
  browser.pause(2250);
}

let logInAccount = function(username, password) {
  browser.$('#at-field-username_and_email').waitForExist(4000);
  browser.$('#at-field-username_and_email').setValue(username);
  browser.$('#at-field-password').setValue(password);
  browser.pause(250);
  browser.$('#at-btn').waitForExist(5000);
  browser.$('#at-btn').click();
  browser.pause(250);
}



let signOut = function() {
  browser.executeAsync(function(done) {
    Meteor.logout(function () {
      Router.go('landingPage');
      done()
    })
  })
}

let delayedGo = function(loc) {
  browser.executeAsync(function(route, done) {
    Router.go(route);
    setTimeout(done, 200)
  }, loc)
}

let getMethods = function(obj)
{
  var res = [];
  for(var m in obj) {
    if(typeof obj[m] == "function") {
      res.push(m)
    }
  }
  return res;
}


let xor = function(a, b) {
  return (a && !b) || (!a && b)
};

module.exports = myStepDefinitionsWrapper;