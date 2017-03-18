/*
* JS file for landing_page.html
*/

Template.landingPage.events({
  'click [data-action="signUp"]': function(e) {
    e.stopPropagation();
    $('#login-dropdown-list').addClass('open');
    $('#login-username-or-email').focus();
  },

});
