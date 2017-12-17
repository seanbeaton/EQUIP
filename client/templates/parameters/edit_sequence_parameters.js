/*
* JS file for edit_sequence_parameters.html
* Propigates current sequence parameters
*/

var serialize = require('form-serialize');

//Try to short circuit "enter" button?
Template.editSequenceParameters.rendered = function() {
  $(document).keypress(function(e) {
     if (e.keyCode == 13) {
      e.preventDefault();
      return;
    }
  });
}

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
  labels = ["Discourse Type", "Teacher Solicitation","Wait Time", "Solicitation Method", "Length of Talk", "Student Talk",  "Explicit Evaluation"]

  for (i=0;i<labels.length;i++){
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
      if (labels[i] == "Discourse Type") {
        inputValue = "Logistics,Content"
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
      if (labels[i] == "Teacher Solicitation") {
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

      if (labels[i] == "Discourse Type") {
        $('<input/>', {
          class: "checkbox",
          type: "checkbox",
          style: "margin: .5em",
          name: "toggle"+i,
          checked: true
        }).appendTo(checkbox);
      } else {
        $('<input/>', {
          class: "checkbox",
          type: "checkbox",
          style: "margin: .5em",
          name: "toggle"+i,
        }).appendTo(checkbox);
      }
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
        }
        Command: toastr["info"]("Scroll to bottom to edit new parameter.","Parameter Added")
}

Template.editSequenceParameters.events({

  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .back-head-params': function(e) {
   e.preventDefault();
   Router.go('environmentList');
 },
 'click .import-button': function (e) {
    var envId = Router.current().params._envId;
    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;

    fileInput.addEventListener('change', function() {
        var file = fileInput.files[0];
        var jsonImport = {};

        if (file.name.match(/\.(json)$/)) {
            var reader = new FileReader();

            reader.onload = function() {
                var contents = reader.result;
                jsonImport = JSON.parse(contents);
                if ('label0' in jsonImport) {
                  jsonImport['envId'] = envId;

                  Meteor.call('importSeqParameters', jsonImport, function(error, result) {
                    setDefaultSeqParams();
                    return 0;
                  });
                } else {
                  alert("Incorrectly formatted JSON import. No Sequence parameters.");
                }
            };
            reader.readAsText(file);
        } else {
            alert("File not supported, .json files only");
        }
    });
    alert("If you select a valid file to import for this classrom, it will overwrite any parameters already set.")
    fileInput.click(); // opening dialog

 },
 'click .export-button': function (e) {
    e.preventDefault();
    var envId = Router.current().params._envId;
    var env = Environments.findOne({_id:envId});
    var name = env['envName'];
    Meteor.call('exportSeqParameters', envId, function(error, result){
      if (error){
        alert(error.reason);
      } else {
        // Prompt save file dialogue
        if ($.isEmptyObject(result)) {
          alert("There are no parameters to export. Add parameters to this environment to be able to export.");
          return;
        }
        var json = JSON.stringify(result);
        var blob = new Blob([json], {type: "octet/stream"});
        var url  = window.URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.href = url;
        a.download = '' + name + '_seqparams.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  },

 'click .back-to-class': function(e) {
   e.preventDefault();
   Router.go('observationList', {_envId:Router.current().params._envId});
 },
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
  var parameterPairs = 0;
  var form = document.querySelector('#paramForm');
  var obj = serialize(form, { hash: true, empty: false });
  for (key in obj) {
    if (key.includes('label')){
      num = key.split('label')[1];
      if (obj['parameter'+num]){
        parameterPairs++;
      } else {
        alert('One of your parameters has a label but no options. Please fix this issue and try saving again.')
        return;
      }
    }
  }

  var clean_obj = {}
  var count = 0;
  for (key in obj) {
    if (key.includes('label')){
      var n = key.split('label')[1];
      clean_obj['label'+count] = obj[key];
      clean_obj['parameter'+count] = obj['parameter'+n];
      if (obj['toggle'+n]){
        clean_obj['toggle'+count] = obj['toggle'+n];
      }
      count++;
    }
  }
  var extendObj = _.extend(clean_obj, {
    envId: Router.current().params._envId,
    parameterPairs: parameterPairs
  });

  Meteor.call('updateSeqParameters', clean_obj, function(error, result) {
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
        "timeOut": "4000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      }
      Command: toastr["success"]("NOTE: After the first observation is created, you will not be able to edit discourse dimensions or demographics.","Save Successful","Observation Parameters");
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
