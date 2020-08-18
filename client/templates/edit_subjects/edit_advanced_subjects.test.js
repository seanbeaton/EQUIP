/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import {assert} from 'chai';
import {Template} from 'meteor/templating';
import {console_log_conditional} from "/helpers/logging"


// import * as edit_subjects from './edit_subjects'
import {getClassName} from './edit_advanced_subjects'

console_log_conditional('testing');


describe('edit advanced subjects', function () {
  beforeEach(function () {
    Template.registerHelper('_', key => key);
  });

  afterEach(function () {
    Template.deregisterHelper('_');
  });

  it('getClassName works', function () {
    let test1 = getClassName('aBcD s asd S');
    let test1_answer = 'aabcd--s-asd-s';
    let test2 = getClassName('This is a test class');
    let test2_answer = 'this-is-a-test-class';
    assert.equal(test1, test1_answer);
    assert.equal(test2, test2_answer);
  })
})
