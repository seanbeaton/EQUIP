/*
* JS file for header.html
*/
Template.header.events({
  'click #signOut': function (e) {
    Meteor.logout(function () {
      console.log("user logged out");
      Router.go('landingPage');
      gtag('event', 'logout', {'event_category': 'User'})
    });
  },

//   $(document).mouseup(function(e) {
//   var secondary = $("#block-subnavigation-menu");
//
//   // if the target of the click isn't the container nor a descendant of the container
//   if (secondary.hasClass('open') && !secondary.is(e.target) && secondary.has(e.target).length === 0) {
//     secondary.siblings('.menu').toggleClass('open');
//     secondary.siblings('.menu').slideToggle();
//     secondary.toggleClass('open');
//   }
//
//   var main = $('#block-dlaw-main-menu');
//   var burger = $('#burger-check');
//   if (burger.is(':checked') && !$('.burger').is(e.target) && !main.is(e.target) && main.has(e.target).length === 0) {
//     burger.prop('checked', false);
//     $('#block-dlaw-main-menu a').attr('tabindex', '-1');
//   }
// });


  'click .dropdown-wrapper': function(e) {
    $('.dropdown-wrapper').toggleClass('dropdown-wrapper--open');

    $(document).off('mouseup').on('mouseup', function(e) {

      let menu_wrapper = $('.dropdown-wrapper');
      if (!menu_wrapper.hasClass('dropdown-wrapper--open')) {
        return;
      }

      if (!menu_wrapper.is(e.target) && menu_wrapper.has(e.target).length === 0) {
        menu_wrapper.removeClass('dropdown-wrapper--open');
      }
    });
  },

//
     'mouseenter .dropdown-wrapper': function(e) {
         // document.querySelector('.dropdown-wrapper .fa-caret-down').classList.add('hide');
         // document.querySelector('.dropdown-wrapper .fa-caret-up').classList.remove('hide');
         //
         // if (Meteor.userId()) {
         //     var loginLink = document.getElementById('login-name-link');
         //     loginLink.innerHTML = "";
         //     loginLink.classList.remove("login-link-text");
         //     loginLink.classList.add("login-link-text-sign-in");
         // }
     },
     'mouseleave .dropdown-wrapper': function(e) {
         // document.querySelector('.dropdown-wrapper .fa-caret-up').classList.add('hide');
         // document.querySelector('.dropdown-wrapper .fa-caret-down').classList.remove('hide');
     },
     'click #login-buttons': function(e) {
         setTimeout(function(){
             var signInCloseBtn = document.querySelector('.login-close-text');
             if (signInCloseBtn) {
                 signInCloseBtn.innerHTML = "X";
             }
         }, 0);
     },
     'click #login-name-link': function(e) {
         setTimeout(function(){
             if (Meteor.userId()) {
                 var dropDownSignIn = document.getElementById('login-dropdown-list');
                 dropDownSignIn.classList.add("login-dropdown-list-sign-in");
             }
         },0)
     },
     'click .modal-background': function(e){
       $('#seq-param-modal').removeClass('is-active');
       $('#onboarding-modal').removeClass('is-active');
       $('#help-env-modal').removeClass("is-active");
     },
     'click .modal-close': function(e){
       $('#seq-param-modal').removeClass('is-active');
       $('#onboarding-modal').removeClass('is-active');
     }
});

Template.header.helpers({
    isBetaThankYou: function() {
        var routerPath = Router.current().route.path();
        var getLocalStorage = window.localStorage.getItem("firstSession");

        if (routerPath === "/" && !getLocalStorage) {
            window.localStorage.setItem("firstSession", true);
            return true;
        } else {
            return false;
        }
    }
});

Template.header.rendered = function() {
    setTimeout(function(){
        var loginText = document.getElementById('login-name-link');
        if (loginText) {
            loginText.innerHTML = "";
        }
    },100)
    closeModal();
}

function closeModal() {
    let closeButton = document.querySelector(".modal-close");
    let modalBackground = document.querySelector(".modal-background");
    let learnMoreLink = document.querySelector(".c--onboard-modal__body-link");
    let modal = document.getElementById("onboarding-modal");

    closeButton.addEventListener("click", (e) => {
        modal.classList.remove("is-active");
    });

    modalBackground.addEventListener("click", (e) => {
        modal.classList.remove("is-active");
    });

    learnMoreLink.addEventListener("click", (e) => {
        modal.classList.remove("is-active");
    });
}
