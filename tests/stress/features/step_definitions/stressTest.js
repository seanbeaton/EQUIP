const assert = require('assert');

var myStepDefinitionsWrapper = function () {
  this.Given(/^I am on the staging site$/, function(callback) {
    browser.url('https://data-obs-staging.herokuapp.com/');
    callback()
  });

  this.When(/^If I'm not logged in, I create an account with username prefix "([^"]*)" and password "([^"]*)"$/, function(user, pass, callback) {

    let current_user = browser.execute(() => {return Meteor.user()});
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
  browser.$('#at-btn').waitForExist(2000);
  browser.$('#at-btn').click();
  browser.$('#at-btn').click();
  browser.pause(2250);
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