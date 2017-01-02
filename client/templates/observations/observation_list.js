/*
* JS file for observation list.html
*/

Template.observationList.helpers({
  observation: function() {
    var obs = Observations.find({envId:this._id}, {sort: {submitted: -1}}).fetch();
    console.log(obs);
    console.log(this);
    return obs;
  }
});

Template.observationList.events({
'click .back-head-params': function(e) {
   e.preventDefault();
   Router.go('environmentList');
 },
 'click .editObsItem': function(e) {
     e.preventDefault();
     Router.go('editSubjects', {_envId:this._id});
  },

  'click #obs-create-button': function(e) {
    $('#obs-create-modal').addClass("is-active");
  },
  'click #obs-close-modal': function(e) {
    $('#obs-create-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#obs-create-modal').removeClass("is-active");
  },
  'click #save-obs-name': function(e) {

    var observation = {
      name: $('#observationName').val(),
      envId: this._id
    };

    if ($('#observationName').val() == "") {
      alert("Observation name required.");
      return;
    }

    Meteor.call('observationInsert', observation, function(error, result) {
      return 0;
    });

    $('#observationName').val('');
  }
});

Template.observationList.rendered = function() {

}
