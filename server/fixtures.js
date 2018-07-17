/*
* JS fixtures file
* Handle automatic creation of admin accounts and database collections on meteor reset
*/
Accounts.onCreateUser(function(options, user) {
   // Use provided profile in options, or create an empty object
   user.profile = options.profile || {};
   user.profile.betaThankYou = false;
   return user;
});
