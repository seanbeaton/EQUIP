/*
* JS file for observation_environment_item.html
*/

Template.observationEnvironmentItem.helpers({
  envSequence: function() {
    return Sequences.find({envId: Router.current().params._envId});
  },
  needsSetup: function() {
    var obj = Subjects.find({envId: Router.current().params._envId}).fetch();
    return $.isEmptyObject(obj);
  },
  needsObservations: function() {
    var obj = Observations.find({envId: this._id}).fetch();
    return $.isEmptyObject(obj)?"green-pulse":"";
  }
});

Template.observationEnvironmentItem.events({
  'click .editObsItem': function(e) {
     e.preventDefault();
     Router.go('editSubjects', {_envId:this._id});
  },
  'click #enter-class': function(e){
    e.preventDefault();
    obsId = $(e.target).attr('data-id');
    Router.go('observatory', {_envId:this._id, _obsId: obsId });
  },

  'click #env-create-button': function(e) {
    $('#env-create-modal').addClass("is-active");
  },

  'click #save-obs-name': function(e) {

    var observation = {
      name: $('#obsName').val(),
      envId: this._id,
      active: true
    };

    if ($('#observationName').val() == "") {
      alert("Observation name required.");
      return;
    }
    $('#obsName').removeClass("requiredValidation")

    Meteor.call('observationInsert', observation, function(error, result) {
      return 0;
    });

    $('#createObsPopup').modal('hide');
    $('#observationName').val('');
  },
  'click .allSequences': function(e) {
   propigateSequenceTableBody();
   $('#allSequencesPopup').modal({
     keyboard: true,
     show: true
   });
 },
 'click #saveAllSequences': function(e) {
   $('#allSequencesPopup').modal('hide');
 },
 'click .deleteSequence': function(e) {
   var result = confirm("Press 'OK' to delete this Sequence.");
   seqId = $(e.target).attr("seqId");
   Meteor.call('sequenceDelete', seqId, function(error, result) {
     return 0;
   });
   propigateSequenceTableBody();
 }
});


