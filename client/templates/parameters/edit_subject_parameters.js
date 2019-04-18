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
  },
  hasObsMade: function() {
      var env = Environments.find({_id:Router.current().params._envId}).fetch();
      var obs = Observations.find({envId:env[0]._id}, {sort: {lastModified: -1}}).fetch();
      if (obs.length === 0) {
          return true
      }
  }
});

//Helper function for adding a field in the subj
function addSubjFields() {
  var formCounter = $("#paramForm .single-param").length;
  var container = document.getElementById("paramForm");

  var singleParam = $('<div/>', {
      class: "single-param control myParam"+formCounter
    }).appendTo(container);

      $('<label/>', {
        class: "label",
        text: "Name:"
      }).appendTo(singleParam);

      $('<input/>', {
        class: "input",
        type: "text",
        name: "label"+formCounter,
        placeholder: "Name"
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
        class: "button is-small is-danger is-pulled-right removeDem remove"+formCounter,
        text: "Remove Parameter",
        style: "margin-right: .5em"
      }).appendTo(singleParam);

      removeButton.click( function (e) {
        e.preventDefault();
        var test = $(this).parent().remove();
      });

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

Template.editSubjectParameters.events({
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

                  Meteor.call('importSubjParameters', jsonImport, function(error, result) {
                    setDefaultDemographicParams();
                    return 0;
                  });
                } else {
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
  let parameterPairs = 0;
  let formValidated = true;
  const form = document.querySelector('#paramForm');
  const obj = serialize(form, { hash: true, empty: false });

  for (key in obj) {
    if (key.includes('label')){
      num = key.split('label')[1];
      if (obj['parameter'+num]){
        parameterPairs++;
      } else {
        alert('One of your parameters has a label but no options. Please fix this issue and try saving again.')
        return;
      }
    } else {
        obj[key] = obj[key].split(",").filter(function(o) { return o }).join(",");
        const demoKeys = obj[key].split(",");

        demoKeys.forEach((key) => {
            if (key.trim().length === 0) {
                alert("One of your options are blank. Please enter with the correct format.");
                formValidated = false;
            }
        });
    }
  }

  if (!formValidated) return;

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
  var existingObj = SequenceParameters.find({'children.envId':clean_obj.envId}).fetch();
  gtag('event',  'save', {'event_category': 'seq_params', 'event_label': JSON.stringify(clean_obj)});
  if ($.isEmptyObject(existingObj) == true) {
    Meteor.call('updateSubjParameters', clean_obj, function(error, result) {
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
          window.location.href = "/environmentList"
      },1000)
    });
  } else {
    Meteor.call('updateSubjParameters', clean_obj, function(error, result) {
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
        Command: toastr["success"]("NOTE: After the first observation is created, you will not be able to edit discourse dimensions or demographics.","Save Successful","Demographic Parameters");
      }
    });

    setTimeout(() => {
        window.location.href = "/environmentList"
    },1000)
  }
}
});

Template.editSubjectParameters.rendered = function() {
    let editDemo = new EditDemographics();

    editDemo.init();
    editDemo.hideRemoveButtons();
}


const EditDemographics = function() {
    function hideRemoveButtons() {
        var obsMade = document.getElementById('obsMade');

        if (obsMade) {
            var allRemoveButtons = document.querySelectorAll('.removeDem');

            [...allRemoveButtons].forEach((button)=> { button.style.display = "none"; });
        }
    }
    function addRemoveButtonEvents() {
        let removeButtons = document.querySelectorAll(".removeDem");
        [...removeButtons].forEach((button) => {
            $(button).unbind("click").click(function(){
                var result = confirm("Are you sure you want to delete?");
                if (result) {
                    event.target.parentElement.remove();
                }
            });
        });
    }
    function addParamButtonEvent() {
        let addButton = document.getElementById("add-demo-param");

        if (!addButton) return;

        addButton.addEventListener("click", addParamRowTemplate);
    }
    function addLoadDefaultEvent() {
        let loadDefaultButton = document.getElementById("load-default-demo");

        if (!loadDefaultButton) return;

        loadDefaultButton.addEventListener("click", loadDefaultParamTemplate);
        addRemoveButtonEvents();
    }
    function addParamRowTemplate() {
        let container = document.getElementById("paramForm");
        let lastIndex = document.querySelectorAll(".single-param").length;

        container.insertAdjacentHTML('beforeend', oneParamRowTemplate(lastIndex));
        addRemoveButtonEvents();
    }

    function loadDefaultParamTemplate() {
        let container = document.getElementById("paramForm");
        container.innerHTML = loadParamTemplate();
        addRemoveButtonEvents();
    }
    function loadParamTemplate() {
        const defaultDemoData = [
            {
                name: "Race",
                input: "Asian, Black, Latinx, Native, White, Mixed Race"
            },
            {
                name: "Gender",
                input: "Girl, Boy, Nonbinary"
            }
        ];

        let defaultNodes = defaultDemoData.map((data,idx) => {
            return oneResultTemplate(data,idx)
        }).join("");

        return `
            <form id="paramForm">
                ${defaultNodes}
            </form>
        `
    }

    function oneResultTemplate(data,idx) {
        return `
            <div class="single-param control myParam${idx}">
                <label class="o--form-labels">Name:</label>
                <input class="o--form-input" type="text" name="label${idx}" value="${data.name}">
                <label class="o--form-labels">Options:</label>
                <input class="o--form-input" type="text" style="margin-bottom: .25em" name="parameter${idx}" value="${data.input}">
                <p class="o--toggle-links c--discourse-form__remove-button removeDem">Remove</p>
            </div>
        `
    }

    function oneParamRowTemplate(index) {
        return `
            <div class="single-param control myParam0">
                <label class="o--form-labels">Name:</label>
                <input class="o--form-input" type="text" name="label${index}" placeholder="Name">
                <label class="o--form-labels">Options:</label>
                <input class="o--form-input" type="text" style="margin-bottom: .25em" name="parameter${index}" placeholder="List the options for selection separated by commas (e.g. male, female, unspecificied).">
                <p class="o--toggle-links c--discourse-form__remove-button removeDem">Remove</p>
            </div>
        `
    }
    // Template for no parameters
    function noParamFormTemplate() {
        return `
            <form id="paramForm">
                <div class="single-param control myParam0">
                    <label class="o--form-labels">Name:</label>
                    <input class="o--form-input" type="text" name="label0" placeholder="Name">
                    <label class="o--form-labels">Options:</label>
                    <input class="o--form-input" type="text" style="margin-bottom: .25em" name="parameter0" placeholder="List the options for selection separated by commas (e.g. male, female, unspecificied).">
                    <p class="o--toggle-links c--discourse-form__remove-button removeDem">Remove</p>
                </div>
            </form>
        `
    }

    function hasParamWithObservationTemplate(paramObj, paramPair) {
        let numberOfParams = Array.apply(null, {length: paramPair}).map(Number.call, Number);
        let paramNodes = numberOfParams.map((index)=> {
            let label = paramObj[0]["children"]["label" + index];
            let parameter = paramObj[0]["children"]["parameter" + index];
            let lastRow = paramPair === index + 1 ? oneParamRowTemplate(index + 1) : "";

            return `
                <article class="single-param control myParam${index}">
                    <h3>${label}</h3>
                    <p style="margin-bottom: .25em">${parameter}</p>
                </article>
            `
        }).join("");

        return `
            <div>
                ${paramNodes}
            </div>
        `
    }

    // Template for form with parameters set
    function hasParamFormTemplate(paramObj, paramPair) {
        let numberOfParams = Array.apply(null, {length: paramPair}).map(Number.call, Number);
        let paramNodes = numberOfParams.map((index)=> {
            let label = paramObj[0]["children"]["label" + index];
            let parameter = paramObj[0]["children"]["parameter" + index];
            let lastRow = paramPair === index + 1 ? oneParamRowTemplate(index + 1) : "";

            return `
                <div class="single-param control myParam${index}">
                    <div class="c--discourse-form__label-container">
                        <label class="o--form-labels">Name:</label>
                    </div>
                    <input class="o--form-input" type="text" name="label${index}" value="${label}">
                    <label class="o--form-labels">Options:</label>
                    <input class="o--form-input" type="text" style="margin-bottom: .25em" name="parameter${index}" value="${parameter}">
                    <p class="removeDem c--discourse-form__remove-button o--toggle-links">Remove</p>
                </div>
                ${lastRow}
            `
        }).join("");

        return `
            <form id="paramForm">
                ${paramNodes}
            </form>
        `
    }

    function setDefaultDemographicParams() {
        let envId = Router.current().params._envId;
        let env = Environments.find({_id:Router.current().params._envId}).fetch();
        let parametersObj = SubjectParameters.find({'children.envId':envId}).fetch();
        let obs = Observations.find({envId:env[0]._id}, {sort: {lastModified: -1}}).fetch();
        let paramSection = document.getElementById("paramsSection");
        let parameterPairs;

        if (obs.length > 0 ) {
             parameterPairs = parametersObj[0]["children"]["parameterPairs"];
             paramSection.innerHTML += hasParamWithObservationTemplate(parametersObj, parameterPairs);
        } else {
            $.isEmptyObject(parametersObj)
                ? parameterPairs = 0
                : parameterPairs = parametersObj[0]["children"]["parameterPairs"];

            parameterPairs === 0
                ? paramSection.innerHTML += noParamFormTemplate()
                : paramSection.innerHTML += hasParamFormTemplate(parametersObj, parameterPairs);

            addRemoveButtonEvents();
            addParamButtonEvent();
            addLoadDefaultEvent();
        }
    }

    return {
        init: setDefaultDemographicParams,
        hideRemoveButtons: hideRemoveButtons
    }
}
