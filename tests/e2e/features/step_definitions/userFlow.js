// import {resetDatabase} from "meteor/xolvio:cleaner";
// import {generateData} from "../../../imports/api/generate-data.app-tests"
// import {delayedGo} from "./sharedSteps.js"
const assert = require('assert');

var myStepDefinitionsWrapper = function () {
  // this.Before(function(scenario) {
  //   console.log('this');
  //   server.call('logout');
  //   server.execute(function() {
  //     Package['xolvio:cleaner'].resetDatabase();
  //   });
  //
  // });
  //
  // this.After(function(scenario) {
  //   // resetDatabase();
  // });

  this.Given(/^I have generated an example classroom$/, function (callback) {
    browser.execute((cb) => {Meteor.call('environmentInsertExample', null, function(error, result) { cb(); });}, callback)
  });

  this.Given(/^I visit the login page$/, function (callback) {
    browser.pause(250);
    delayedGo('login');
    callback();
  });

  this.When(/^I create an account with username "([^"]*)" and password "([^"]*)"$/, function(user, pass, callback) {
    createAccount(user, pass)
    callback()
  });

  this.When(/^I create an account with the default test username and password$/, function (callback) {
    createAccount('testuser', 'testuser')
    callback()
  });

  this.When(/^I log in to an account with the username "([^"]*)" and password "([^"]*)"$/, function (user, pass, callback) {
    logInAccount(user, pass)
    callback()
  });

  this.Then(/^I am logged in as the user "([^"]*)"$/, function (arg1, callback) {
    browser.pause(250);
    let current_user = browser.execute(() => {return Meteor.user()});
    assert(current_user.value.username === arg1);
    callback();
  });

  this.When(/^I log in to an account with the default username and password$/, function (callback) {
    logInAccount('testuser', 'testuser');
    callback()
  });
};

let createAccount = function(username, password) {
  browser.$('#at-field-username').waitForExist(4000);
  browser.$('#at-field-username').setValue(username);
  browser.$('#at-field-email').setValue(username + '@example.com');
  browser.$('#at-field-password').setValue(password);
  browser.$('#at-field-password_again').setValue(password);
  browser.$('#at-field-institution').setValue("Institution test");
  browser.$('#at-field-role').setValue("Role test");
  browser.$('#at-field-intended_use').setValue("Intended use test");
  browser.$('#at-field-how_did_you_hear').setValue("How did you hear test");
  browser.pause(250);
  browser.$('#at-btn').waitForExist(2000);
  browser.$('#at-btn').click();
  browser.pause(2250);
  // browser.$('#at-pwd-form').submit();
  // browser.pause(500);

}

let logInAccount = function(username, password) {
  browser.$('#at-field-username_and_email').waitForExist(4000);
  browser.$('#at-field-username_and_email').setValue(username);
  browser.$('#at-field-password').setValue(password);
  browser.pause(250);
  browser.$('#at-btn').waitForExist(2000);
  browser.$('#at-btn').click();
  browser.pause(250);
}


let delayedGo = function(loc) {
  browser.executeAsync(function(route, done) {
    Router.go(route);
    setTimeout(done, 200)
  }, loc)
}

module.exports = myStepDefinitionsWrapper;