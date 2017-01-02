/*
* JS file for environment_list.html
*/

Template.environmentList.rendered = function() {
  $("#navEnv").removeClass("nav-blue-pulse");
  var obj = Environments.find({}).fetch();
  if ($.isEmptyObject(obj)) {
    $('[data-toggle="popover2"]').popover('show').on('click',function(){ $(this).popover('hide')});
  }
}

Template.environmentList.helpers({
  environment: function() {
    var envs = Environments.find({}, {sort: {submitted: -1}}).fetch();
    var obs;
    var subjects;
    var user = Meteor.user();
    var total_students = Subjects.find({userId: user._id}).count();
    var total_obs = Sequences.find({userId: user._id}).count();
    _.map(envs, function (env) {
      console.log(env._id);
    });

    var results = {list: envs, num_env: parseInt(envs.length), num_students: parseInt(total_students), num_obs: parseInt(total_obs)};

    return results;
  },
  needsEnvironment: function() {
    var obj = Environments.find({}).fetch();

    return $.isEmptyObject(obj)?"green-pulse":"";
  }
});

Template.environmentList.events({
   'click #env-create-button': function(e) {
    $('#env-create-modal').addClass("is-active");
  },
    'click #env-close-modal': function(e) {
    $('#env-create-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#env-create-modal').removeClass("is-active");
  },

  //  'click #createNewEnvironment': function(e) {
  //   $('#createEnvPopup').modal({
  //     keyboard: true,
  //     show: true
  //   });
  //   $('#createEnvPopup').on('shown.bs.modal', function () {
  //     $('#environmentName').focus();
  //   })
  // },

  'click #save-env-name': function(e) {


  // 'click #save-env-name': function(e) {

    var environment = {
      envName: $('#environmentName').val()
    };

    if ($('#environmentName').val() == "") {
      alert("Environment name required.");
      return;
    }

    Meteor.call('environmentInsert', environment, function(error, result) {
      return 0;
    });

    $('#env-create-modal').removeClass("is-active");
    $('#environmentName').val('');
  }
});
