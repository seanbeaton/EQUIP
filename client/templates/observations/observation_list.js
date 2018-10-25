/*
* JS file for observation list.html
*/

import * as observation_helpers from '/client/helpers/observations.js';

Template.observationList.helpers({
  observation: function() {
      var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
      return obs;
  },
  hasObsMade: function() {
      var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
      if (obs.length === 0) {
          return true
      }
  }
});




Template.observationList.events({
'click .back-head-params': function(e) {
   e.preventDefault();
   Router.go('environmentList');
 },
 'click #edit-params-button': function (e){
    e.preventDefault();
    Router.go('editSubjectParameters', {_envId:this._id});
 },
 'click #edit-students-button': function(e) {
     e.preventDefault();
     Router.go('editSubjects', {_envId:this._id});
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click #obs-create-button': function(e) {
    $('#obs-create-modal').addClass("is-active");
  },
  'click #obs-close-modal': function(e) {
    $('#obs-create-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#obs-create-modal').removeClass("is-active");
    $('#help-env-modal').removeClass("is-active");
  },
  'click #save-obs-name': function(e) {

    var observation = {
      name: $('#observationName').val(),
      envId: this._id,
      timer: 0
    };

    var sequenceParams = SequenceParameters.findOne({'children.envId': this._id});
    var demographicParams = SubjectParameters.findOne({'children.envId': this._id});
    var observations = Observations.find({"envId": this._id}).fetch();

    if ($('#observationName').val() == "") {
      alert("Observation name required.");
      return;
    }

    if (sequenceParams === undefined || demographicParams === undefined) {
        alert("You must add students and parameters to the environment to continue to do the observation.")
        return;
    }

    if (observations.length === 0 ) {
        var confirmation = getConfirmation();
        if (confirmation) {
            Meteor.call('observationInsert', observation, function(error, result) {
              return 0;
            });

            $('#observationName').val('');
        }
    } else {
        Meteor.call('observationInsert', observation, function(error, result) {
          return 0;
        });

        $('#observationName').val('');
    }

    function getConfirmation() {
        var retVal = confirm("Are you sure? After the first observation is created, you will not be able to edit discourse dimensions or demographics.");
        if (retVal === true) {
            return true;
        }
        else {
            return false;
        }
    }
  },
  'click .delete-seq': function(e) {
    observation_helpers.deleteContribution(e);
  },
  'click .modal-close': function(e){
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
  },
  'click #show-all-observations':function (e){
    observation_helpers.createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  },
});