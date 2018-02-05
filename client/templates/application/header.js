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
     },
     'mouseleave .dropdown-wrapper': function(e) {
         document.querySelector('.dropdown-wrapper .fa-caret-up').classList.add('hide');
         document.querySelector('.dropdown-wrapper .fa-caret-down').classList.remove('hide');
     }
});
