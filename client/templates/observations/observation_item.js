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
  },
  'click .edit-seq': function(e) {
    observation_helpers.editContribution(e);
  },
  'click #edit-observation-name': function(e) {
    editObservationName(this._id);
  },
  'click .delete-seq': function(e) {
    observation_helpers.deleteContribution(e);
  },
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


function editObservationName(obsId) {
  let context = $('.observation[data-obs-id="' + obsId + '"]');

  var obs_name = $('.observation-name', context);
  var obs_name_wrapper = $('.observation-name-wrapper', context);
  var currently_editing = !!(obs_name.hasClass('editing'));
  var edit_swap_button = $('#edit-observation-name', context);

  edit_swap_button.addClass('is-loading');

  if (!currently_editing) {
    obs_name_wrapper.prepend($('<input>', {
      class: 'edit-obs-name inherit-font-size',
      value: obs_name.html()
    }));

    obs_name.addClass('editing');
    obs_name.hide();

    $(context, '.edit-obs-name').on('keyup', function(e) {
      if (e.keyCode === 13) {
        edit_swap_button.click()
      }
    })
  }

  else {
    var new_obs_name = $('.edit-obs-name', context);
    var new_name = new_obs_name.val();

    var args = {
      'obsId': obsId,
      'obsName': new_name,
    };

    Meteor.call('observationRename', args, function(error, result) {
      var message;
      if (result) {
        message = $('<span/>', {
          class: 'name-save-result tag is-success inline-block success-message',
          text: 'Saved'
        });
        obs_name.html(new_name);
      }
      else {
        message = $('<span/>', {
          class: 'name-save-result tag is-warning inline-block error-message',
          text: 'Failed to save. Try again later'
        })
      }
      obs_name_wrapper.append(message);

      setTimeout(function() {
        message.remove();
      }, 3000);

      return 0;
    });

    new_obs_name.remove();
    obs_name.removeClass('editing');

    console.log('go');
    obs_name.show();
  }

  edit_swap_button.removeClass('is-loading');
  currently_editing = !currently_editing;
  edit_swap_button.html((currently_editing) ? 'Save' : 'Edit')
}