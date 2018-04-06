/*
* JS file for header.html
*/
Template.header.events({
     'click #signOut': function(e){
         Meteor.logout(function(){
             console.log("user logged out");
         });
     },
     'mouseenter .dropdown-wrapper': function(e) {
         document.querySelector('.dropdown-wrapper .fa-caret-down').classList.add('hide');
         document.querySelector('.dropdown-wrapper .fa-caret-up').classList.remove('hide');

         if (Meteor.userId()) {
             var loginLink = document.getElementById('login-name-link');
             loginLink.innerHTML = "";
             loginLink.classList.remove("login-link-text");
             loginLink.classList.add("login-link-text-sign-in");
         }
     },
     'mouseleave .dropdown-wrapper': function(e) {
         document.querySelector('.dropdown-wrapper .fa-caret-up').classList.add('hide');
         document.querySelector('.dropdown-wrapper .fa-caret-down').classList.remove('hide');
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
     'click #login-buttons-password': function(e) {
         e.preventDefault();
         if (e.target.innerText === "CREATE ACCOUNT") {
             $('#onboarding-modal').addClass('is-active');
         }
     },
     'keypress input': function(event) {
         if (event.keyCode == 13) {
             $('#onboarding-modal').addClass('is-active');
             event.stopPropagation();
             return false;
         }
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
}

var setBetaThankYouFlag = function() {
    var user = Meteor.user();
    var counter = 5;

    // retry until a user is returned.
    while (counter > 0 ) {
        if (!user) {
            counter--;
        } else {
            break;
        };
    }
    if (!user || Router.current().route.path().length > 2) return;

    if (!user.profile.betaThankYou) {
        Meteor.users.update(Meteor.userId(),{$set: {profile: {betaThankYou:true}}});
    }
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
