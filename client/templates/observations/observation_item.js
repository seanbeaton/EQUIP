/*
* JS file for observation_environment_item.html
*/

Template.observationItem.events({
   'click .enterObsItem': function(e) {
     Router.go('observatory', {_envId: this.envId, _obsId: this._id});
   },
   'click #delete-obs-button': function(e) {
     var result = confirm("Deleting an observation will also delete all sequences taken in the specific observation. Press 'OK' to continue.");
     obsId = this._id
    if (result) {
      Meteor.call('observationDelete', obsId, function(error, result) {
        return 0;
      });
    }
  }
 });

 Template.observationItem.helpers({

   needsSequences: function() {
     var obj = Sequences.find({envId: Router.current().params._envId}).fetch();
     console.log(this)
     return $.isEmptyObject(obj)?"light-green-pulse":"";
   }
  });

 Template.observationItem.rendered=function() {
    
 }
