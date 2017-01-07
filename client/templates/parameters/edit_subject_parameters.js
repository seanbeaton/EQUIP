/*
* JS file for edit_subject_parameters.html
* Propigates current subject parameters
*/

var serialize = require('form-serialize');

Template.editSubjectParameters.helpers({
  environment: function() {
     var env = Environments.find({_id:Router.current().params._envId}).fetch();
     var result = env[0];
     return result;
  }

});


//Helper function for adding defaults

function loadDefaultSubjParams() {

  $('#paramForm').remove();

  $('<form/>', {
    id: 'paramForm',
  }).appendTo('#paramsSection');

  var container = document.getElementById("paramForm");
  labels = ["Race", "Gender"];

  for (i=0;i<2;i++){
     var singleParam = $('<div/>', {
      class: "single-param control myParam"+i
      }).appendTo(container);

      $('<label/>', {
        class: "label",
        text: "Parameter Name:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        name: "label"+i,
        value: labels[i],
      }).appendTo(singleParam);

      $('<label/>', {
        class: "label",
        text: "Options:"
      }).appendTo(singleParam);

      var inputValue = "";
     
      if (labels[i] == "Race") {
        inputValue = "American Indian or Alaska Native,Asian,Black or African American,Native Hawaiian or Other Pacific Islander,White,Hispanic or Latino,Unknown"
      }
      if (labels[i] == "Gender") {
        inputValue = "Male,Female,Other,Unknown"
      }

      $('<input/>', {
        class: "input",
        type: "text",
        style: "margin-bottom: .25em",
        name: "parameter"+i,
        value: inputValue
      }).appendTo(singleParam);

      removeButton = $('<button/>', {
        class: "button is-small is-danger is-pulled-right remove"+i,
        text: "Remove Parameter",
        style: "margin-right: .5em"
      }).appendTo(singleParam);

      removeButton.click( function (e) {
        e.preventDefault();
        var test = $(this).parent().remove();
      });
  }
}

//Helper function for adding a field in the subj
function addSubjFields() {
  var formCounter = $("#paramForm .single-param").length;
  var container = document.getElementById("paramForm");

  var singleParam = $('<div/>', {
      class: "single-param control myParam"+formCounter
    }).appendTo(container);

      $('<label/>', {
        class: "label",
        text: "Parameter Name:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        name: "label"+formCounter,
        placeholder: "Name of your parameter"
      }).appendTo(singleParam);

      $('<label/>', {
        class: "label",
        text: "Options:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        style: "margin-bottom: .25em",
        name: "parameter"+formCounter,
        placeholder: "List the options for selection separated by commas (e.g. male, female, unspecificied) or leave blank to for text input."
      }).appendTo(singleParam);

      removeButton = $('<button/>', {
        class: "button is-small is-danger is-pulled-right remove"+formCounter,
        text: "Remove Parameter",
        style: "margin-right: .5em"
      }).appendTo(singleParam);

      removeButton.click( function (e) {
        e.preventDefault();
        var test = $(this).parent().remove();
      });

}

Template.editSubjectParameters.events({
'click .back-head-params': function(e) {
   e.preventDefault();
   Router.go('environmentList');
 },
 'click .obs-param-button': function(e) {
   e.preventDefault();

   Router.go('editSequenceParameters', {_envId:Router.current().params._envId});
 },
'click #add-demo-param': function(e) {
  e.preventDefault();
  addSubjFields();
 },
'click #load-default-demo': function(e) {
  e.preventDefault();
  loadDefaultSubjParams();
},

'click #save-demo-params': function(e) {
  e.preventDefault();

  var parameterPairs = $("#paramForm .single-param").length;
  var form = document.querySelector('#paramForm');
  var obj = serialize(form, { hash: true, empty: true });
  var extendObj = _.extend(obj, {
    envId: Router.current().params._envId,
    parameterPairs: parameterPairs
  });
  var existingObj = SequenceParameters.find({'children.envId':obj.envId}).fetch();
  if ($.isEmptyObject(existingObj) == true) {
    Meteor.call('updateSubjParameters', obj, function(error, result) {
      if (error){
        alert(error.reason);
      } else {
        toastr.options = {
          "closeButton": false,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-top-right",
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
        }
        Command: toastr["success"]("Save Successful", "Demographic Parameters")
      }
      Router.go('editSequenceParameters', {_envId:Router.current().params._envId});
    });
  } else {
    Meteor.call('updateSubjParameters', obj, function(error, result) {
      if (error){
        alert(error.reason);
      } else {
        toastr.options = {
          "closeButton": false,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-top-right",
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
        }
        Command: toastr["success"]("Save Successful", "Demographic Parameters")
      }

    });
  }
}
});

Template.editSubjectParameters.rendered = function() {
  setDefaultDemographicParams();
}

function setDefaultDemographicParams() {

  var envId = Router.current().params._envId;

  $('<form/>', {
    id: 'paramForm',
  }).appendTo('#paramsSection');

  var container = document.getElementById("paramForm");

  parametersObj = SubjectParameters.find({'children.envId':envId}).fetch();

  if ($.isEmptyObject(parametersObj) == true) {
    parameterPairs = 0;
  } else {
    parameterPairs = parametersObj[0]["children"]["parameterPairs"];
  }
  if (parameterPairs == 0) {
    var singleParam = $('<div/>', {
      class: "single-param control myParam0"
    }).appendTo(container);

      $('<label/>', {
        class: "label",
        text: "Parameter Name:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        name: "label0",
        placeholder: "Name of your parameter"
      }).appendTo(singleParam);

      $('<label/>', {
        class: "label",
        text: "Options:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        style: "margin-bottom: .25em",
        name: "parameter0",
        placeholder: "List the options for selection separated by commas (e.g. male, female, unspecificied) or leave blank to for text input."
      }).appendTo(singleParam);

      removeButton = $('<button/>', {
        class: "button is-small is-danger is-pulled-right remove0",
        text: "Remove Parameter",
        style: "margin-right: .5em"
      }).appendTo(singleParam);

      removeButton.click( function (e) {
        e.preventDefault();
        var test = $(this).parent().remove();
      });

  } else {
    for (i=0;i<parameterPairs;i++) {
      var singleParam = $('<div/>', {
      class: "single-param control myParam"+i
      }).appendTo(container);

      $('<label/>', {
        class: "label",
        text: "Parameter Name:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        name: "label"+i,
        value: parametersObj[0]["children"]["label"+i]
      }).appendTo(singleParam);

      $('<label/>', {
        class: "label",
        text: "Options:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        style: "margin-bottom: .25em",
        name: "parameter"+i,
        value: parametersObj[0]["children"]["parameter"+i]
      }).appendTo(singleParam);

      var removeButton = $('<button/>', {
        class: "button is-small is-danger is-pulled-right remove"+i,
        text: "Remove Parameter",
        style: "margin-right: .5em; margin-bottom: .5em"
      }).appendTo(singleParam);

      removeButton.click( function (e) {
        e.preventDefault();
        var test = $(this).parent().remove();
      });
    }
  }
}
