
Template.sharedEnv.events({
  'click .save-shared-env': function(e) {
    e.preventDefault();
    e.stopPropagation();
    //
    // if (!Meteor.user()) {
    //   console.log('logged out');
    // }

    Router.go('sharedEnvSave', {_shareId:Router.current().params._shareId});
  }
})

Template.sharedEnvSave.rendered = function() {
  if (confirm('Are you sure you want to copy this classroom?')) {
    copySharedClassroom(Router.current().params._shareId);
    Router.go('environmentList')
  }
  else {
    Router.go('sharedEnv', {_shareId:Router.current().params._shareId})
  }
}


Template.sharedEnv.helpers({
  sequenceParams: function() {
    var sharedEnv = SharedEnvironments.findOne({_id:Router.current().params._shareId});
    let params = [];
    for (let i = 0; i < sharedEnv.sequenceParameters.children.parameterPairs; i++) {
      params.push({
        'label': sharedEnv.sequenceParameters.children[`label${i}`],
        'parameter': sharedEnv.sequenceParameters.children[`parameter${i}`]
      })
    }
    return params;
  },
  subjectParams: function() {
    var sharedEnv = SharedEnvironments.findOne({_id:Router.current().params._shareId});
    let params = [];
    for (let i = 0; i < sharedEnv.subjectParameters.children.parameterPairs; i++) {
      params.push({
        'label': sharedEnv.subjectParameters.children[`label${i}`],
        'parameter': sharedEnv.subjectParameters.children[`parameter${i}`]
      })
    }
    return params;
  },
  students: function() {
    let sharedEnv = SharedEnvironments.findOne({_id:Router.current().params._shareId});
    return sharedEnv.students;
  }
});


function copySharedClassroom(shareId) {
  Meteor.call('environmentImportShared', shareId, function(error, result) {
    if (error) {
      alert(error)
    }
    else {
      toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "2000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      };
      toastr["info"]("Classroom copied.");
      console.log(result);
    }
  })
}