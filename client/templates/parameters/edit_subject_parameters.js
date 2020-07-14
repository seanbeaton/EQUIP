/*
* JS file for edit_subject_parameters.html
* Propigates current subject parameters
*/
import {console_log_conditional} from "/helpers/logging"

import {envHasObservations} from "../../../helpers/environments";
import {upgradeParams} from "../../../helpers/migration_transforms";

var serialize = require('form-serialize');

const localParams = ReactiveVar({});

Template.editSubjectParameters.onCreated(function created() {
  this.autorun(() => {
  })
  let params = SubjectParameters.findOne({envId: Router.current().params._envId});
  if (!params) {
    localParams.set({parameters: [{
        label: "",
        options: []
      }]}
    )
  }
  else {
    localParams.set(params)
  }
});


Template.editSubjectParameters.helpers({
  environment: function() {
     var env = Environments.find({_id:Router.current().params._envId}).fetch();
     var result = env[0];
     return result;
  },
  hasObsMade: function() {
    return envHasObservations(this.environment._id)
  },
  params: function() {
    return localParams.get();
  },
  joined: function(list) {
    return list.join(', ');
  },
});

Template.editSubjectParameters.events({
  'click #load-default-demo': function (e) {
    e.preventDefault();
    const defaultDemoData = [
      {
        label: "Race",
        options: ["Asian", "Black", "Latinx", "Native", "White", "Mixed Race"]
      },
      {
        label: "Gender",
        options: ["Girl", "Boy", "Nonbinary"]
      }
    ];
    localParams.set({parameters: defaultDemoData});
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .remove-param': function(e) {
    let pms = localParams.get();
    let target_index = $(e.target).attr('data-remove-index');
    pms.parameters.splice(target_index, 1)
    localParams.set(pms)
  },
  'click #add-demo-param': function(e) {
    let pms = localParams.get();
    pms.parameters.push({
      label: "",
      options: []
    })
    localParams.set(pms)
  },
  'blur .parameter__label': function(e) {
    let target_index = $(e.target).attr('data-param-index');
    let pms = localParams.get();
    pms.parameters[target_index].label = $(e.target).val()
    localParams.set(pms)
  },
  'blur .parameter__options': function(e) {
    let target_index = $(e.target).attr('data-param-index');
    let pms = localParams.get();
    pms.parameters[target_index].options = $(e.target).val() ? $(e.target).val().split(',').map(function (item) {return item.trim();}) : []
    localParams.set(pms)
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

                  // allow old json imports to work.
                  let import_params = {
                    children: jsonImport,
                  }
                  import_params.children.envId = envId;
                  let params = upgradeParams(import_params)

                  Meteor.call('importSubjParameters', params, function(error, result) {
                    setDefaultDemographicParams();
                    return 0;
                  });
                } else if ('parameters' in jsonImport) {
                  jsonImport.envId = envId;
                  Meteor.call('importSubjParameters', jsonImport, function(error, result) {
                    setDefaultDemographicParams();
                    return 0;
                  });
                }
                else {
                  alert("Incorrectly formatted JSON import. No Subject parameters.");
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
    Meteor.call('exportSubjParameters', envId, function(error, result){
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
        a.download = '' + name + '_subjparams.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  },

'click #save-demo-params': function(e) {
  e.preventDefault();
  let envId = Router.current().params._envId;
  let formValidated = true;

  let params = localParams.get()
  params.parameters = params.parameters.filter(function(param) {
    if (!param.label && param.options.length === 0) {
      return false;
    }
    if (!param.label) {
      alert('One of your parameters has a label but no options. Please fix this issue and try saving again.')
      formValidated = false;
    }
    if (param.label.search(/[$.\/]/i) > 0) {
      alert('One of your parameters has a label with an invalid character. Please do not use the following characters: . $ /')
      formValidated = false;
    }
    if (param.options.length === 0) {
      alert('One of your parameters has no options. Please fix this issue and try saving again.')
      formValidated = false;
    }
    return true;
  })

  if (!formValidated) return;

  gtag('event', 'save', {'event_category': 'seq_params', 'event_label': JSON.stringify(params)});
  let method = 'updateSubjParameters'
  if ($.isEmptyObject(SubjectParameters.findOne({envId:envId})) === true) {
    method = 'importSubjParameters'
  }

  Meteor.call(method, {envId: envId, parameters: params.parameters}, function(error, result) {
    if (error){
      alert(error.reason);
    } else {
      toastr.options = {
        "closeButton": false,
        "debug": true,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-bottom-full-width",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "5000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
      }
      Command: toastr["success"]("NOTE: After the first observation is created, you will not be able to edit discourse dimensions or demographics.","Save Successful","Demographic Parameters");
    }
    setTimeout(() => {
      window.jumpToEnv = envId
      Router.go('environmentList')
    },1000)
  });
}
});