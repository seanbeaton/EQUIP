/*
* JS file for edit_sequence_parameters.html
* Propigates current sequence parameters
*/
import {console_log_conditional} from "/helpers/logging"

import {envHasObservations} from "../../../helpers/environments";
import {upgradeParams} from "../../../helpers/migration_transforms";


const localParams = ReactiveVar({});

Template.editSequenceParameters.onCreated(function created() {
  // this.autorun(() => {
  // })
  let params = SequenceParameters.findOne({envId: Router.current().params._envId});
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
    return this.environment;
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

Template.editSequenceParameters.events({
  'click #load-default-seq': function (e) {
    e.preventDefault();
    const defaultSeqData = [
      {
        label: "Teacher Solicitation",
        options: ["How","What","Why","Other","None"]
      },
      {
        label: "Wait Time",
        options: ["Less than 3 seconds","3 or more seconds","N/A"]
      },
      {
        label: "Solicitation Method",
        options: ["Called On","Not Called On"]
      },
      {
        label: "Length of Talk",
        options: ["1-4 words","5-20","21 or more"]
      },
      {
        label: "Student Talk",
        options: ["How","What","Why","Other"]
      }
    ];
    localParams.set({parameters: defaultSeqData});
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

                  Meteor.call('importSeqParameters', params, function(error, result) {
                    setDefaultSeqParams();
                    return 0;
                  });
                } else if ('parameters' in jsonImport) {
                  jsonImport.envId = envId;
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
    alert("If you select a valid file to import for this classroom, it will overwrite any parameters already set.")
    fileInput.click(); // opening dialog

 },
  'click .remove-param': function(e) {
    let pms = localParams.get();
    let target_index = $(e.target).attr('data-remove-index');
    pms.parameters.splice(target_index, 1)
    localParams.set(pms)
  },
  'click #add-seq-param': function(e) {
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
    pms.parameters[target_index].label = $(e.target).val();
    localParams.set(pms)
  },
  'blur .parameter__options': function(e) {
    let target_index = $(e.target).attr('data-param-index');
    let pms = localParams.get();
    pms.parameters[target_index].options = $(e.target).val() ? $(e.target).val().split(',').map(function (item) {return item.trim();}) : []
    localParams.set(pms)
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
  'click #save-seq-params': function(e) {
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
    });

    if (!formValidated) return;
    gtag('event', 'save', {'event_category': 'sequence_params', 'event_label': JSON.stringify(params)});
    let method = 'updateSeqParameters'
    if ($.isEmptyObject(SequenceParameters.findOne({envId:envId})) === true) {
      method = 'importSeqParameters'
    }

    Meteor.call(method, {envId: envId, parameters: params.parameters}, function(error, result) {
      if (error){
        alert(error.reason);
      } else {
        toastr.options = {
          "closeButton": false,
          "debug": false,
          "newestOnTop": false,
          "progressBar": false,
          "positionClass": "toast-bottom-full-width",
          "preventDuplicates": false,
          "onclick": null,
          "showDuration": "300",
          "hideDuration": "1000",
          "timeOut": "5000",
          "extendedTimeOut": "1000",
          "showEasing": "swing",
          "hideEasing": "linear",
          "showMethod": "fadeIn",
          "hideMethod": "fadeOut"
        }
        Command: toastr["success"]("NOTE: After the first observation is created, you will not be able to edit discourse dimensions or demographics.","Save Successful","Observation Parameters");
      }
      setTimeout(() => {
        window.jumpToEnv = envId
        Router.go('environmentList')
      },1000)
    });
  }
});

