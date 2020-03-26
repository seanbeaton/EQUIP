const assert = require('assert');
import {console_log_conditional} from "../../../../helpers/logging";

var myStepDefinitionsWrapper = function () {

  this.Given(/^I visit the homepage$/, function (callback) {
    delayedGo('landingPage');
    callback()
  });
  this.Given(/^I visit the about page$/, function (callback) {
    delayedGo('aboutPage');
    callback()
  });
};


let delayedGo = function(loc) {
  browser.executeAsync(function(route, done) {
    Router.go(route);
    setTimeout(done, 200)
  }, loc)
}


module.exports = myStepDefinitionsWrapper;