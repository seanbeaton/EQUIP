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
  },
  hasObsMade: function() {
      var env = Environments.find({_id:Router.current().params._envId}).fetch();
      var obs = Observations.find({envId:env[0]._id}, {sort: {lastModified: -1}}).fetch();
      if (obs.length === 0) {
          return true
      } else {
          return false
      }
  }
});

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
'click #save-seq-params': function(e) {
  e.preventDefault();
  var parameterPairs = 0;
  let formValidated = true;
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
    } else {
      obj[key] = obj[key].split(",").filter(function(o) { return o }).join(",");
      const sequenceKeys = obj[key].split(",");

      sequenceKeys.forEach((key) => {
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
  ga('Sequence Parameters', 'Save', JSON.stringify(clean_obj));

  Meteor.call('updateSeqParameters', clean_obj, function(error, result) {
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
        window.location.href = "/environmentList"
    },1000)
  });
}
});

Template.editSequenceParameters.rendered = function() {
    let editSequence = new EditSequence();

    editSequence.init();
    editSequence.hideRemoveButtons();
}

const EditSequence = () => {
    function hideRemoveButtons() {
        var obsMade = document.getElementById('obsMade');

        if (obsMade) {
            var allRemoveButtons = document.querySelectorAll('.removeSeq');

            [...allRemoveButtons].forEach((button)=> { button.style.display = "none"; });
        }
    }
    function addRemoveButtonEvents() {
        let removeButtons = document.querySelectorAll(".removeSeq");
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
        let addButton = document.getElementById("add-seq-param");
        if (addButton) {
            addButton.addEventListener("click", addParamRowTemplate);
        }
    }
    function addLoadDefaultEvent() {
        let loadDefaultButton = document.getElementById("load-default-seq");

        if (loadDefaultButton) {
            loadDefaultButton.addEventListener("click", loadDefaultParamTemplate);
            addRemoveButtonEvents();
        }
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
        const defaultSequenceData = [
            {
                name: "Discourse Type",
                input: "Logistics,Content"
            },
            {
                name: "Teacher Solicitation",
                input: "How,What,Why,Other"
            },
            {
                name: "Wait Time",
                input: "Less than 3 seconds,3 or more seconds,N/A"
            },
            {
                name: "Solicitation Method",
                input: "Called On,Not Called On"
            },
            {
                name: "Length of Talk",
                input: "1-4 words,5-20,21 or more"
            },
            {
                name: "Student Talk",
                input: "How,What,Why,Other"
            },
            {
                name: "Explicit Evaluation",
                input: "Yes,No"
            }
        ]

        let defaultNodes = defaultSequenceData.map((data,idx) => {
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
                <p class="o--toggle-links c--discourse-form__remove-button removeSeq">Remove</p>
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
                <p class="o--toggle-links c--discourse-form__remove-button removeSeq">Remove</p>
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
                    <p class="o--toggle-links c--discourse-form__remove-button removeSeq">Remove</p>
                </div>
            </form>
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
                    <p class="removeSeq c--discourse-form__remove-button o--toggle-links">Remove</p>
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

    function setDefaultSeqParams() {
        let env = Environments.find({_id:Router.current().params._envId}).fetch();
        let envId = Router.current().params._envId;
        let parametersObj = SequenceParameters.find({'children.envId':envId}).fetch();
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
        init: setDefaultSeqParams,
        hideRemoveButtons: hideRemoveButtons
    }
}
