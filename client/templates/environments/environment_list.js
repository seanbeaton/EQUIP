/*
* JS file for environment_list.html
*/


Template.environmentList.rendered = function() {
  if (document.querySelector(".toggle-accordion")) {
      document.querySelectorAll('.toggle-accordion')[0].click(); // main
      document.querySelectorAll('.toggle-accordion')[1].click(); // observations
  }

  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("onboarding")) {
      $('#onboarding-modal').removeClass("is-active");
      $('#env-create-modal').addClass("is-active");
  }
  processDatepickers()
}

Template.environmentList.helpers({
  environment: function() {
    var envs = Environments.find({}, {sort: {submitted: -1}}).fetch();
    var obs;
    var subjects;
    var user = Meteor.user();
    var total_students = Subjects.find({userId: user._id}).count();
    var total_obs = Sequences.find({userId: user._id}).count();
    var results = {list: envs, num_env: parseInt(envs.length), num_students: parseInt(total_students), num_obs: parseInt(total_obs)};

    return results;
  },
  currentISODate: function() {
    let date = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return date.getFullYear() +
    '-' + pad(date.getMonth() + 1) +
    '-' + pad(date.getDate())
  },
  currentUSDate: function() {
    let date = new Date();
    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }
    return pad(date.getMonth() + 1) +
    '/' + pad(date.getDate()) +
    '/' + date.getFullYear();
  },
  needsEnvironment: function() {
    var obj = Environments.find({}).fetch();

    return $.isEmptyObject(obj)?"green-pulse":"";
  }
});

Template.environmentList.events({
  'click #analyze-button': function (e){
    e.preventDefault();
    e.stopPropagation();
    Router.go('reportsSelection');
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
   'click #env-create-button': function(e) {
    $('#env-create-modal').addClass("is-active");
  },
   'click #env-close-modal': function(e) {
    $('#env-create-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#env-create-modal').removeClass("is-active");
    $('#help-env-modal').removeClass("is-active");
  },
  'click #obs-create-button': function(e) {
    var id = e.target.getAttribute('data-id');
    $('#obs-create-modal').addClass("is-active");
    $('#obs-create-modal').attr("data-id", id);
  },
  'click #obs-close-modal': function(e) {
    $('#obs-create-modal').removeClass("is-active");
  },
  'click #save-obs-name': function(e) {
    var id = $('#obs-create-modal').attr("data-id");
    var sequenceParams = SequenceParameters.findOne({'children.envId': id});
    var demographicParams = SubjectParameters.findOne({'children.envId': id});
    var observations = Observations.find({"envId": id}).fetch();
    var obsAccordion = $(`.c--accordion-item__inner[data-id=${id}]`);

    var observation = {
      name: $('#observationName').val(),
      observationDate: $('#altObservationDate').val(),
      envId: id,
      timer: 0
    };

    if (!observation.name) {
      alert("Observation name required.");
      return;
    }

    if (!observation.observationDate) {
      alert("Observation date required.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(observation.observationDate)) {
      alert('Please input a valid date in YYYY-MM-DD format');
      return;
    }

    if (sequenceParams === undefined || demographicParams === undefined) {
        alert("You must add students and parameters to the environment to continue to do the observation.")
        return;
    }

    if (observations.length === 0 ) {
        var confirmation = getConfirmation();
        if (!confirmation) {
          return;
        }
    }
    Meteor.call('observationInsert', observation, function(error, result) {
      return 0;
    });
    $('#observationName').val('');
    $('#obs-close-modal').click();

    if (!$(obsAccordion).next().hasClass("show")) {
      $(obsAccordion).click();
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
'click #enter-class': function(e) {
  // var obj1 = SubjectParameters.find({'children.envId': this._id}).fetch();
  // var obj2 = SequenceParameters.find({'children.envId': this._id}).fetch();
  // if ($.isEmptyObject(obj1) || $.isEmptyObject(obj2) || $.isEmptyObject(obj3)) {
  //  alert('You must add students to the environment to continue to do the observation.');
  //  return;
  // }
    var obsId = $(e.target).attr("data-id");
    Router.go('observatory', {_envId: this._id, _obsId: obsId});
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
  },
  'click .generate-example-classroom': function() {
    Meteor.call('environmentInsertExample', null, function(error, result) {
      return 0;
    });
  }
});


function processDatepickers() {
  $('.datepicker:not(.datepicker--processed)').addClass('datepicker--processed').datepicker({
    dateFormat: 'mm/dd/yy',
    altField: '#altObservationDate',
    altFormat: 'yy-mm-dd'
  })
}