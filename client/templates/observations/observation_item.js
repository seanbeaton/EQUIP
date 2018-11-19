/*
* JS file for observation_environment_item.html
*/

import * as observation_helpers from '/client/helpers/observations.js'

Template.observationItem.events({
   'click #enter-class': function(e) {
     var obj1 = SubjectParameters.find({'children.envId': Router.current().params._envId}).fetch();
     var obj2 = SequenceParameters.find({'children.envId': Router.current().params._envId}).fetch();
     var obj3 = Subjects.find({envId: Router.current().params._envId}).fetch();

     if ($.isEmptyObject(obj1) || $.isEmptyObject(obj2) || $.isEmptyObject(obj3)) {
      alert('You must add students to the environment to continue to do the observation.');
      return;
     }
     Router.go('observatory', {_envId: this.envId, _obsId: this._id});
   },
   'click #delete-obs-button': function(e) {
       var result = confirm("Deleting an observation will also delete all sequences taken in the specific observation. Press 'OK' to continue.");
       var obsId = this._id;
       if (result) {
        Meteor.call('observationDelete', obsId, function(error, result) {
          return 0;
        });
      }
     // ga('Observations', 'Delete observation')
   },
  'click .modal-close': function(e){
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
  },
  'click #view-edit-contributions':function (e){
    var obj1 = Sequences.find({obsId: this._id}).fetch();
    if ($.isEmptyObject(obj1)) {
      alert('You do not have any sequences yet, please make sure your environment is fully setup.');
      return;
    }
    observation_helpers.createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
    // ga('Observations', 'View contributions')
  },
  // 'click .edit-seq': function(e) {
  //   observation_helpers.editContribution(e);
  // },
  // 'click .delete-seq': function(e) {
  //   observation_helpers.deleteContribution(e);
  // },
  'click #edit-seq-params': function(e) {
    seqId = $(e.target).attr('data_seq');

    var info = {};
      info['studentId'] = $('.student-modal-head').attr('data_id');
      info['Name'] = $('.student-modal-head').attr('data_name');
      let envId = Router.current().params._envId;
      let obsId = this._id;
      var choices = [];
      var labels = [];
      //Do this always in the case of editing from obs list

        $('.subj-box-labels').each(function () {
          labels.push(this.textContent);
          var c = $(this).siblings('.chosen')[0];
          if (c) {
            choices.push(c.textContent);
          } else {
            choices.push(null);
          }
        });

      for (label in labels) {
        info[labels[label]] = choices[label];
      }

      var sequence = {
        info: info,
        seqId: seqId
      };

      Meteor.call('sequenceUpdate', sequence, function(error, result) {
       if (error) {
         alert(error.reason);
       } else {
        $('#seq-param-modal').removeClass('is-active');
       }
     });
    //This should happen at the end...
    const seq = Sequences.findOne({_id: seqId});
    obsId = seq['obsId'];
    $('#seq-param-modal').removeClass('is-active');
    observation_helpers.createTableOfContributions(obsId);
    $('#seq-data-modal').addClass('is-active');
  }
 });

 Template.observationItem.helpers({

   needsSequences: function() {
     var obj = Sequences.find({envId: Router.current().params._envId}).fetch();
     return $.isEmptyObject(obj)?"light-green-pulse":"";
   }
  });

