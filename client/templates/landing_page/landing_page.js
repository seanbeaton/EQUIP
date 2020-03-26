/*
* JS file for landing_page.html
*/
import {console_log_conditional} from "/helpers/logging"

Template.landingPage.events({
  'click [data-action="signUp"]': function(e) {
    e.stopPropagation();
    $('#login-dropdown-list').addClass('open');
    $('#login-username-or-email').focus();
  },
   'click .c--landing-page__c2a-learn-more-link': function(e) {
       e.stopPropagation();
       smoothScrollToNavigation();
   }
});

  function smoothScrollToNavigation() {
      $('html, body').animate({
          scrollTop: $("#login-buttons").offset().top - 100
      }, 500);
  }
