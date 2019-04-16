/*
* JS file for configuring Meteor Packages
* Configuration for accounts-ui package
*/

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Accounts.createUser = _.wrap(Accounts.createUser, function(createUser) {
    // Store the original arguments
    var args = _.toArray(arguments).slice(1),
        user = args[0];
        origCallback = args[1];

    var newCallback = function(error) {
        $('#onboarding-modal').addClass('is-active');
        origCallback.call(this, error);
    };

    createUser(user, newCallback);
});;
