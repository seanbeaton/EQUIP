import {console_log_conditional} from "../../../../helpers/logging";

const assert = require('assert');

var myStepDefinitionsWrapper = function () {
  this.Given(/^I am on the site$/, function(callback) {
    browser.url('http://localhost:3005')
    callback()
  });

  this.When(/^I click "([^"]*)" with class "\.?([^"]*)"$/, function (label, cssClass, callback) {
    let link = browser.$('.' + cssClass);
    link.waitForExist(2000);
    link.click();
    callback()
  });

  this.Given(/^a clean database$/, function (callback) {
    server.call('logout');
    server.execute(function() {
      Package['xolvio:cleaner'].resetDatabase();
    });
    callback()
  });


  this.Given(/^I am logged in as a new test user$/, function (callback) {
    server.call('logout');
    server.execute(function() {
      Accounts.createUser({
        username: "testuser",
        email: "testuser@example.com",
        password: "testuser"
      });
    })
    server.call('logout');
    browser.execute(function() {
      Meteor.loginWithPassword('testuser', 'testuser')
    });
    callback()
  });

  this.Given(/^a new test user exists$/, function (callback) {
    server.call('logout');
    server.execute(function() {
      Accounts.createUser({
        username: "testuser",
        email: "testuser@example.com",
        password: "testuser"
      });
    })
    server.call('logout');
    callback()
  });


  this.Given(/^I am logged out/, function (callback) {
    let user = browser.execute(() => {return Meteor.user()});
    if (!user) {
      callback()
    }

    signOut();
    callback()
    // browser.execute((cb) => {Meteor.logout(function(err) {console_log_conditional('err2', err);cb();})}, callback);
  });


  this.Given(/^I visit the "([^"]*)" page$/, function (arg1, callback) {
    browser.pause(250);
    delayedGo(arg1);
    callback();
  });

  this.Then(/^I see the page header text is "([^"]*)"$/, function (arg1, callback) {
    let title = browser.$('h1, .page__heading');
    title.waitForExist(2000);
    assert.strictEqual(title.getText().toLowerCase(), arg1.toLowerCase());
    callback()
  })
  this.When(/^I click on the link with path "([^"]*)" in the wrapper "\.?([^"]*)"$/, function (path, wrapper, callback) {
    let link = browser.$('.' + wrapper + ' a[href="' + path + '"]')
    link.waitForExist(2000);
    link.click();
    callback()
  });


  this.Then(/^I( don't | )see (a|an|[\d]+) "([^"]*)"( with( out| )the text "([^"]*)"|)$/, function (see_negation, number, selector, needs_text, text_negation, text, callback) {
    see_negation = see_negation === " don't ";
    text_negation = text_negation === "out ";
    if (number === "a" || number === "an") {
      let searchItem = browser.$(selector);
      if (!see_negation) {
        searchItem.waitForExist(2000);
      }
      else {
        browser.pause(2000);
        assert(!searchItem.isExisting());
      }
      browser.pause(100);
      if (needs_text !== "") {
        assert.ok(text_negation !== (searchItem.getText().indexOf(text) !== -1))
      }
      callback()
    }
    else {
      let searchItems = browser.elements(selector);
      let found_items = 0;
      searchItems.value.forEach(function(searchItem) {
        // console_log_conditional('searchItem', searchItem);
        if (!see_negation) {
          // console_log_conditional("check does exist");
          searchItem.waitForExist(2000);
          found_items += 1;
        }
        else {
          // console_log_conditional("check doesn't exist");
          browser.pause(2000);
          // assert(!searchItem.isExisting());
          assert(!searchItem.isExisting() || !searchItem.type || searchItem.type === "NoSuchElement");
        }

        browser.pause(100);
        if (needs_text !== "") {
          assert.ok(text_negation !== (searchItem.getText().indexOf(text) !== -1))
        }
      });
      // assert(found_items === parseInt(number));
      assert(xor(found_items === parseInt(number), see_negation));
      callback()
    }
  });

  this.Then(/^I( don't | )see (a|an|[\d]+) "([^"]*)"( with( out| )the text "([^"]*)"|) in the wrapper "([^"]*)"$/, function (see_negation, number, selector, needs_text, text_negation, text, wrapper_sel, callback) {
    see_negation = see_negation === " don't ";
    text_negation = text_negation === "out ";
    let wrapper = browser.$(wrapper_sel);
    wrapper.waitForExist(2000);
    if (number === "a" || number === "an") {
      let searchItem = wrapper.$(selector);

      if (!see_negation) {
        searchItem.waitForExist(2000);
      }
      else {
        browser.pause(2000);
        assert(!searchItem.isExisting() || !searchItem.type || searchItem.type === "NoSuchElement");
      }
      browser.pause(100);
      if (needs_text !== "") {
        assert.ok(text_negation !== (searchItem.getText().indexOf(text) !== -1))
      }
      callback()
    }
    else {
      let searchItems = wrapper.elements(selector);
      let found_items = 0;
      searchItems.value.forEach(function(searchItem) {

        if (!see_negation) {
          searchItem.waitForExist(2000);
          found_items += 1;
        }
        else {
          browser.pause(2000);
          assert(!searchItem.isExisting());
        }

        browser.pause(100);
        if (needs_text !== "") {
          assert.ok(text_negation !== (searchItem.getText().indexOf(text) !== -1))
        }
      });
      assert(xor(found_items === parseInt(number), see_negation));
      callback()
    }
  });

  this.When(/^I wait "([\d]*)" ms$/, function (ms, callback) {
    browser.pause(ms);
    callback();
  });

  this.When(/^I click on the item with the selector "([^"]*)"$/, function (sel, callback) {
    browser.pause(250);
    let item = browser.$(sel);
    item.waitForExist(2000);
    item.click();
    callback();
  });

  this.When(/^I hover over the item with the selector "([^"]*)"$/, function (sel, callback) {
    let item = browser.$(sel);
    item.waitForExist(2000);
    // item.scrollIntoView();
    browser.executeAsync((sel, cb) => {
      document.querySelector(sel).dispatchEvent(new Event("mouseover"));
      // console_log_conditional('hovering sel', sel);
      cb()
    }, sel);
    callback();
  });

  this.When(/^I click on the item with the selector "([^"]*)" in the wrapper "([^"]*)"$/, function (sel, wrapper_sel, callback) {
    let wrapper = browser.$(wrapper_sel);
    wrapper.waitForExist(2000);
    let item = wrapper.$(sel);
    item.waitForExist(2000);
    item.click();
    callback();
  });

  this.When(/^I click on the item with the selector "([^"]*)" if "([^"]*)" is( not | )display none/, function (sel, if_sel, negate, callback) {
    negate = negate === ' not ';
    let searchItem = browser.$(if_sel);
    searchItem.waitForExist(2000);
    // console_log_conditional('searchItem', searchItem);
    // console_log_conditional('searchItem.getCssProperty(\'display\').value', searchItem.getCssProperty('display').value);

    let xor = function(a, b) {
      return (a && !b) || (!a && b)
    }

    if (xor(searchItem.getCssProperty('display').value === 'none', !!negate)) {
      let item = browser.$(sel);
      item.waitForExist(2000);
      item.click();
      browser.pause(300)
    }

    callback();
  });

  this.Then(/^The values of css property "([^"]*)" on elements "([^"]*)" and "([^"]*)" are (the same|different)/, function (prop, el_1, el_2, different, callback) {
    different = different === 'different';
    let $el_1 = browser.$(el_1);
    let $el_2 = browser.$(el_2);
    $el_1.waitForExist(2000);
    $el_2.waitForExist(2000);
    // console_log_conditional('el1', $el_1.getCssProperty(prop).value);
    // console_log_conditional('el2', $el_2.getCssProperty(prop).value);
    assert(xor($el_1.getCssProperty(prop).value === $el_2.getCssProperty(prop).value, !!different));
    callback();
  });


  this.Then(/^The values of css property "([^"]*)" on element "([^"]*)" and attribute "([^"]*)" on element "([^"]*)" are (the same|different)/, function (prop_1, el_1, prop_2, el_2, different, callback) {
    different = different === 'different';
    let $el_1 = browser.$(el_1);
    let $el_2 = browser.$(el_2);
    $el_1.waitForExist(2000);
    $el_2.waitForExist(2000);

    console_log_conditional('el1 css', prop_1, $el_1.getCssProperty(prop_1));
    console_log_conditional('el1 css', prop_1, $el_1.getCssProperty(prop_1).value);
    console_log_conditional('el2 attr', prop_2, $el_2.getAttribute(prop_2));
    assert(xor($el_1.getCssProperty(prop_1).value === $el_2.getAttribute(prop_2), !!different));
    callback();
  });

  this.Then(/^The values of attribute "([^"]*)" on element "([^"]*)" and attribute "([^"]*)" on element "([^"]*)" are (the same|different)/, function (prop_1, el_1, prop_2, el_2, different, callback) {
    different = different === 'different';
    let $el_1 = browser.$(el_1);
    let $el_2 = browser.$(el_2);
    $el_1.waitForExist(2000);
    $el_2.waitForExist(2000);
    assert(xor($el_1.getAttribute(prop_1) === $el_2.getAttribute(prop_2), !!different));
    callback();
  });


  this.When(/^Fill in the field with selector "([^"]*)" with the value "([^"]*)"$/, function (sel, val, callback) {
    let field = browser.$(sel);
    field.waitForExist(4000);
    field.setValue(val);
    callback();
  });

  this.When(/^I select the (option|chosen) in select "([^"]*)" with the (value|label) "([^"]*)"$/, function (chosen, sel, val_or_label, val, callback) {
    if (chosen === 'chosen') {
      assert(false);
      // browser.executeAsync((sel, val_or_label, val, cb) => {
      //   console_log_conditional('sel, val_or_label, val', sel, val_or_label, val);
      //   let chosen = document.querySelector(sel);
      //   console_log_conditional('chosen', chosen);
      //
      //   let selectItemByIndex = function(dropdown, label) {
      //     console_log_conditional('dropdown, label', dropdown, label);
      //     const index = Array.from(dropdown.options).findIndex(option => option.label === label);
      //     console_log_conditional('index', index);
      //     if (!index) {return dropdown.selectedIndex = index}
      //   }
      //   if (val_or_label === 'label') {
      //     selectItemByIndex(chosen, val);
      //     $(chosen).trigger('chosen:updated');
      //   }
      //   else {
      //     $(chosen).val(val);
      //     $(chosen).trigger('chosen:updated');
      //   }
      //   cb()
      // }, sel, val_or_label, val)
    }
    else {
      let select = browser.$(sel);
      select.waitForExist(4000);
      console_log_conditional(sel, val_or_label, val);
      if (val_or_label === 'label') {
        console_log_conditional('before select vis text', select.getText('option:checked'))
        select.selectByVisibleText(val);
        console_log_conditional('after select vis text', select.getText('option:checked'))
      }
      else {
        select.selectByAttribute("value", val);
      }
    }
    callback();
  });

  this.Given(/^the "([^"]*)" is removed$/, function (remove, callback) {
    browser.execute(function(el) {
      let remove_el = document.querySelector(el);
      if (remove_el) {
        remove_el.remove()
      }
    }, remove);
    callback();
  });
  this.Then(/^an alert with the( partial | )text "([^"]*)"( does not | )exist[s]?$/, function (can_be_partial, alert_search_text, negation, callback) {
    can_be_partial = can_be_partial === ' partial ';
    negation = negation === ' does not ';
    // console_log_conditional('browser', Object.getOwnPropertyNames(browser));
    let alert_text = browser.alertText();
    browser.alertAcceptSync();

    if (can_be_partial) {
      assert(negation !== (alert_text.includes(alert_search_text)));
    }
    else {
      assert(negation !== (alert_text === alert_search_text));
    }
    callback();
  });


  this.Then(/^I (confirm|dismiss) the alert$/, function (confirm, callback) {
    confirm = confirm === 'confirm';
    // console_log_conditional('searchItem', Object.getOwnPropertyNames(browser).filter((key) => key.startsWith("alert")));
    if (confirm) {
      browser.alertAcceptSync();
    } else {
      browser.alertDismissSync();
    }
    callback();
  });


  this.Then(/^I am on the route "([^"]*)"$/, function (route_name, callback) {
    let current_route = browser.executeAsync(function(route_name, done) {
      done(Router.current().route.getName())
    }, route_name);
    assert(current_route.value === route_name);
    callback();
  });


  this.When(/^the field "([^"]*)" (has|doesn't have) the text "([^"]*)"$/, function (field_sel, negation, text, callback) {
    negation = negation === "doesn't have";
    let field = browser.$(field_sel);
    field.waitForExist(2000);
    assert(xor(text === field.getValue(), negation));
    callback();
  });

  this.When(/^I refresh the browser$/, function (callback) {
    browser.refresh();
    callback();
  });
};


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
    setTimeout(done, 1000)
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