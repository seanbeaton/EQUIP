/*
* JS file for edit_sequence_parameters.html
* Propigates current sequence parameters
*/

var serialize = require('form-serialize');
 
Template.editSequenceParameters.helpers({
  environment: function() {
     var env = Environments.find({_id:Router.current().params._envId}).fetch();
     var result = env[0];
     return result;
  }
});

function loadDefaultSeqParams() {
 
  $('#paramForm').remove();

  $('<form/>', {
    id: 'paramForm',
  }).appendTo('#paramsSection');

  var container = document.getElementById("paramForm");
  labels = ["WCD Type", "Solicitation Method", "Wait Time", "Length of Talk", "Student Talk", "Teacher Soliciation", "Explicit Evaluation"]

  for (i=0;i<7;i++){
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
      if (labels[i] == "WCD Type") {
        inputValue = "Math,Non-Math"
      }
      if (labels[i] == "Solicitation Method") {
        inputValue  = "Called On,Not Called On"
      }
      if (labels[i] == "Wait Time") {
        inputValue  = "Less than 3 seconds,3 or more seconds,N/A"
      }
      if (labels[i] == "Length of Talk") {
        inputValue  = "1-4 words,5-20,21 or more"
      }
      if (labels[i] == "Student Talk") {
        inputValue =  "How,What,Why,Other"
      }
      if (labels[i] == "Teacher Soliciation") {
        inputValue =  "How,What,Why,Other"
      }
      if (labels[i] == "Explicit Evaluation") {
        inputValue = "Yes,No"
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

      checkbox = $('<label/>', {
        class: "checkbox",
        text: "Toggle?"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "checkbox",
        type: "checkbox",
        style: "margin: .5em",
        name: "toggle"+i,
      }).appendTo(checkbox);
  }
}

function addSeqFields() {
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
        placeholder: "List the options for selection separated by commas (e.g. male, female, unspecificied)."
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

      checkbox = $('<label/>', {
        class: "checkbox",
        text: "Toggle?"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "checkbox",
        type: "checkbox",
        style: "margin: .5em",
        name: "toggle"+formCounter,
      }).appendTo(checkbox);
}

Template.editSequenceParameters.events({
'click .demo-param-button': function(e) {
   e.preventDefault();
   Router.go('editSubjectParameters', {_envId:Router.current().params._envId});
 },
'click #add-seq-param': function(e) {
  e.preventDefault();
  addSeqFields();
 },
'click #load-default-seq': function(e) {
  e.preventDefault();
  loadDefaultSeqParams();
},
// 'click .remove-button': function(e) {
//   e.preventDefault();
//   alert("Not Working");
// },
'click #save-seq-params': function(e) {
  e.preventDefault();
  var parameterPairs = $("#paramForm .single-param").length;
  var form = document.querySelector('#paramForm');
  var obj = serialize(form, { hash: true, empty: true });
  var extendObj = _.extend(obj, {
    envId: Router.current().params._envId,
    parameterPairs: parameterPairs
  });
  Meteor.call('updateSeqParameters', obj, function(error, result) {
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
      Command: toastr["success"]("Save Successful", "Observation Parameters")
    }
  });
}
});

Template.editSequenceParameters.rendered = function() {
  setDefaultSeqParams();
}

function setDefaultSeqParams() {

    var envId = Router.current().params._envId;

  $('<form/>', {
    id: 'paramForm',
  }).appendTo('#paramsSection');

  var container = document.getElementById("paramForm");

  parametersObj = SequenceParameters.find({'children.envId':envId}).fetch();

  console.log(parametersObj);
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
        placeholder: "List the options for selection separated by commas (e.g. male, female, unspecificied)."
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

      checkbox = $('<label/>', {
        class: "checkbox",
        text: "Toggle?"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "checkbox",
        type: "checkbox",
        name: "toggle0",
        style: "margin: .5em",
      }).appendTo(checkbox);

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
        style: "margin-right: .5em"
      }).appendTo(singleParam);

      removeButton.click( function (e) {
        e.preventDefault();
        var test = $(this).parent().remove();
      });

      checkbox = $('<label/>', {
        class: "checkbox",
        text: "Toggle?"
      }).appendTo(singleParam);

      var checkVal = "false";
      if (parametersObj[0]["children"]["toggle"+i] == "on") {
        $('<input/>', {
          class: "checkbox",
          type: "checkbox",
          name: "toggle"+i,
          checked: checkVal,
          style: "margin: .5em"
        }).appendTo(checkbox);
      } else {
        $('<input/>', {
          class: "checkbox",
          type: "checkbox",
          name: "toggle"+i,
          style: "margin: .5em"
        }).appendTo(checkbox);
      }
    }
  }
}
