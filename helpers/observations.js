// function createTableOfContributions(obsId) {
//   const modal = $('#data-modal-content');
//
//   modal.children().remove();
//   const envId = Router.current().params._envId;
//   const seqs = Sequences.find({obsId: obsId}).fetch();
//   let seqParams = SequenceParameters.find({'children.envId': envId}).fetch()[0];
//   const parameterPairs = seqParams["children"]["parameterPairs"];
//
//   let allParams = ['Time', 'Name'];
//   for (let p = 0; p < parameterPairs; p++) {
//     allParams.push(seqParams['children']['label' + p]);
//   }
//
//   allParams.push("Edit");
//   allParams.push("Delete");
//
//
//   const table = $('<table/>', {
//     class: "table is-striped"
//   }).appendTo(modal);
//
//   // Create heading
//   $('<thead/>', {}).appendTo(modal);
//   let heading = $('<tr/>', {}).appendTo(table);
//
//   for (let pa in allParams) {
//     $('<th/>', {
//       text: allParams[pa]
//     }).appendTo(heading);
//   }
//   const table_body = $('<tbody/>', {}).appendTo(table);
//   //loop over each student
//   for (let s in seqs) {
//     const row = $('<tr/>', {}).appendTo(table_body);
//     //loop over each parameter
//     for (let p in allParams) {
//       if (allParams[p] === "Delete") {
//         //Add delete button
//         let td = $('<td/>', {}).appendTo(row);
//         let bye = $('<i/>', {
//           class: "fa fa-times delete-seq",
//           data_id: seqs[s]['_id']
//         }).appendTo(td);
//       } else if (allParams[p] === "Edit") {
//         let td = $('<td/>', {}).appendTo(row);
//         let bye = $('<i/>', {
//           class: "fa fa-pencil-square-o edit-seq",
//           data_id: seqs[s]['_id'],
//           data_studentId: seqs[s]['info']['studentId']
//         }).appendTo(td);
//       } else if (allParams[p] === "Time") {
//         let attr = seqs[s]['time'];
//         $('<td/>', {
//           text: convertTime(Number(attr))
//         }).appendTo(row);
//       } else {
//         let attr = seqs[s]['info'][allParams[p]];
//         $('<td/>', {
//           text: attr
//         }).appendTo(row);
//       }
//     }
//   }
// }

// import {setupSubjectParameters} from "./parameters";
import {setupSequenceParameters} from './parameters.js'
import {getStudent, getStudents} from "./students.js";
import {getSequence, getSequences} from "./sequences.js";
import {userHasEnvEditAccess} from "./environments";


function createTableOfContributions(obsId) {
  if (typeof obsId === 'undefined') {
    obsId = Router.current().params._obsId;
  }
  let obs = Observations.findOne({_id: obsId});
  let env = Environments.findOne({_id: obs.envId});
  $('#data-modal-content').children().remove();
  let seqs = getSequences(obsId, env._id);

  let modal = document.getElementById("data-modal-content");
  let allParams = setupSequenceParameters();
  modal.innerHTML += contributionTableTemplate(seqs, allParams, env);
}

function contributionTableTemplate(sequences, parameters, env) {
  var params = parameters;
  var contributionRows = sequences.map((sequence) => {
    return contributionRowTemplate(sequence, params, env)
  }).join("");

  return `
        <div class="c--modal-header-container">
            <h3 class="c--modal-header-title">Contribution Log</h3>
        </div>
        ${contributionRows}
    `
}


function contributionRowTemplate(seqItem, params, env) {
  let paramTemplate = params.map((param) => {
    return `
            <p class="o--modal-label contributions-grid-item">${param.name}</p>
        `
  }).join("");

  let paramValues = params.map((param) => {
    let data = seqItem.info.parameters[param.name] ? seqItem.info.parameters[param.name] : "n/a"
    return `
            <p class="o--modal-label contributions-grid-item">${data}</p>
        `
  }).join("");

  let time = `<p class="o--modal-label contributions-grid-item">${convertTime(Number(seqItem.time))}</p>`
  return `
        <div class="contributions-grid-container">
            <h3 class="contributions-modal-header">${seqItem.info.student.studentName}</h3>
            ` +
    ((!userHasEnvEditAccess(env)) ? '' : `<p class="o--toggle-links contributions-modal-link edit-seq" data-id="${seqItem._id}" data-student-id="${seqItem.info.student.studentId}">Edit</p><p class="o--toggle-links contributions-modal-link delete-seq" data-id="${seqItem._id}" >Delete</p>`)
    + `
        </div>
        <div class="contributions-grid-item-container u--bold">
            <p class="o--modal-label contributions-grid-item">Time</p>
            ${paramTemplate}
        </div>
        <div class="contributions-grid-item-container">
            ${time}
            ${paramValues}
        </div>
    `
}


function convertTime(secs) {
  var hours = Math.floor(secs / (60 * 60));
  if (hours < 10) {
    hours = '0' + hours;
  }
  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  final_str = '' + hours + ':' + minutes + ':' + seconds;
  return final_str;
}
//
// function populateParamBoxes(subjId) {
//   $('#param-modal-content').children().remove();
//   var envId = Router.current().params._envId
//   seqParams = SequenceParameters.find({'children.envId': envId}).fetch()[0];
//   parameterPairs = seqParams["children"]["parameterPairs"];
//   var subj = Subjects.find({_id: subjId}).fetch()[0];
//   var student = subj.info.name;
//
//   var modal = $('#param-modal-content');
//
//   var name = $("<div/>", {
//     class: "columns  boxes-wrapper"
//   }).appendTo(modal);
//
//   var label = $("<h1/>", {
//     class: "column is-12 has-text-centered title is-3 student-modal-head",
//     text: "Enter Contribution for " + student,
//     data_id: subjId,
//     data_name: student
//   }).appendTo(name);
//
//   //
//   //BOX CREATION FOR MODAL
//   //
//   //go through each parameter pair and create a box
//   for (var param = 0; param < parameterPairs; param++) {
//     if (seqParams['children']['toggle' + param] == "on") {
//       continue;
//     }
//     var wrap = $("<div/>", {
//       class: "columns  boxes-wrapper"
//     }).appendTo(modal);
//
//     var label = $("<div/>", {
//       class: "column is-2 has-text-centered subj-box-labels",
//       text: seqParams['children']['label' + param]
//     }).appendTo(wrap);
//
//     var params = seqParams['children']['parameter' + param]
//     var options = params.split(',');
//
//     for (opt in options) {
//
//       var option = $("<div/>", {
//         class: "column has-text-centered subj-box-params hoverable",
//         text: options[opt]
//       }).appendTo(wrap);
//
//       option.click(function (e) {
//         e.preventDefault();
//         $(this).siblings().removeClass('chosen');
//         if ($(this).hasClass('chosen')) {
//           $(this).removeClass('chosen');
//         } else {
//           $(this).addClass('chosen');
//         }
//       });
//     }//end for
//   }//end for
//
//   $("<button/>", {
//     class: "button is-medium is-success",
//     id: "save-seq-params",
//     text: "Save Contribution"
//   }).appendTo(modal);
//
// }


// Saves a new observation
function populateParamBoxes(subjId, seqId) {
  if (typeof seqId === 'undefined') {
    seqId = null;
  }
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId;

  let subj = getStudent(subjId, envId);
  var modal = document.getElementById("param-modal-content");

  let allParams = setupSequenceParameters(subj.envId);

  modal.innerHTML += contributionHeaderTemplate("Enter a contribution for " + subj.info.name, subj.info.name, subjId);
  modal.innerHTML += contributionParameterTemplate(allParams, null, "Save Contribution");

  attachOptionSelection()
}


function editParamBoxes(seqId, subjId, envId) {
  $('#param-modal-content').children().remove();

  var subj = getStudent(subjId, envId);
  var seq = getSequence(seqId, envId);

  var modal = document.getElementById('param-modal-content');

  let allParams = setupSequenceParameters(envId);
  modal.innerHTML += contributionHeaderTemplate(`Edit contribution for ${subj.info.name}`, subj.info.name, subjId);
  modal.innerHTML += contributionParameterTemplate(allParams, seq, "Save Changes");
  attachOptionSelection()
}


function contributionHeaderTemplate(type, studentName, subjId) {
  return `
        <div class="c--modal-header-container js-modal-header" data-id="${subjId}" data-name="${studentName}">
            <h3 class="c--modal-header-title">${type}</h3>
        </div>
    `
}

function contributionParameterTemplate(allParams, sequence, type) {
  let saveBtn = type === "Save Contribution" ? "save-seq-params" : "edit-seq-params";

  let boxes = allParams.map((param) => {

    let options = param.options.split(',').map(function(item) { return item.trim() });

    let optionNodes = options.map((opt) => {
      let selected = "";

      if (sequence) { selected = sequence.info.parameters[param.name] === opt ? "chosen" : "" }
      // console.log('creating options for student, ', student);
      return `
                <div class="column has-text-centered subj-box-params ${selected} optionSelection">
                    ${opt}
                </div>
            `
    }).join("");

    return `

            <div class="c--modal-student-header js-subject-labels">${param.name}</div>
            <div class="c--modal-student-options-container" data-parameter-name="${param.name}">
                ${optionNodes}
            </div>
        `
  }).join("");

  let seqId = sequence ? sequence._id.trim() : "";

  return `
            <!--<button id="randomize-selected" class="o&#45;&#45;standard-button c&#45;&#45;discourse-form__save-button">Randomize</button>-->
        <div class="boxes-wrapper">
        
            ${boxes}
        </div>
        <div class="button-container">
            <button class="o--standard-button u--margin-zero-auto" data-seq="${seqId}" id="${saveBtn}">
                ${type}
            </button>
        </div>
    `
}


function attachOptionSelection() {
  var allNodes = document.querySelectorAll(".optionSelection");
  [...allNodes].forEach((node) => { node.addEventListener("click", handleOptionSelect); });
}


var handleOptionSelect = function() {
  $(this).siblings().removeClass('chosen');
  if ( $(this).hasClass('chosen') ){
    $(this).removeClass('chosen');
  } else {
    $(this).addClass('chosen');
  }
}

function deleteContribution(e, obs) {
  var result = confirm("Press 'OK' to delete this Contribution.");
  if (result == false) {
    gtag('event', 'delete_cancelled', {'event_category': 'sequences'});
    return;
  }
  // const obsId = Router.current().params._obsId;
  const seqId = $(e.target).attr("data-id");
  Meteor.call('sequenceDelete', seqId, function (error, result) {
    gtag('event', 'delete', {'event_category': 'sequences'});
    return 0;
  });
  createTableOfContributions(obs);
}



export {editParamBoxes, createTableOfContributions, populateParamBoxes, deleteContribution}