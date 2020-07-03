import {getStudent, getStudents} from "./students.js";
import {getSequence, getSequences} from "./sequences.js";
import {userHasEnvEditAccess} from "./environments";
import {htmlClass} from "./html";
import {console_log_conditional} from "./logging"

function createTableOfContributions(obsId) {
  if (typeof obsId === 'undefined') {
    obsId = Router.current().params._obsId;
  }
  let obs = Observations.findOne({_id: obsId}, {reactive: false});
  let env = Environments.findOne({_id: obs.envId}, {reactive: false});
  $('#data-modal-content').children().remove();
  let seqs = getSequences(obsId, env._id);

  let modal = document.getElementById("data-modal-content");
  let allParams = SequenceParameters.findOne({envId:obs.envId}).parameters;
  modal.innerHTML += contributionTableTemplate(seqs, allParams, env);
}

function contributionTableTemplate(sequences, parameters, env) {
  var params = parameters;
  console_log_conditional('parms', params);
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
            <p class="o--modal-label contributions-grid-item">${param.label}</p>
        `
  }).join("");

  let paramValues = params.map((param) => {
    let data = seqItem.info.parameters[param.label] ? seqItem.info.parameters[param.label] : "n/a"
    return `
            <p class="o--modal-label contributions-grid-item">${data}</p>
        `
  }).join("");

  // let time = `<p class="o--modal-label contributions-grid-item">${convertTime(Number(seqItem.time))}</p>`
  return `
        <div class="contributions-grid-container">
            <h3 class="contributions-modal-header">${seqItem.info.student.studentName}</h3>
            ` +
    ((!userHasEnvEditAccess(env)) ? '' : `<p class="o--toggle-links contributions-modal-link edit-seq" data-id="${seqItem._id}" data-student-id="${seqItem.info.student.studentId}">Edit</p><p class="o--toggle-links contributions-modal-link delete-seq" data-id="${seqItem._id}" >Delete</p>`)
    + `
        </div>
        <div class="contributions-grid-item-container u--bold">
            ${paramTemplate}
        </div>
        <div class="contributions-grid-item-container">
            ${paramValues}
        </div>
    `
}

// Saves a new observation
function populateParamBoxes(subjId, seqId) {
  if (typeof seqId === 'undefined') {
    seqId = null;
  }
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId;

  let subj = getStudent(subjId, envId);
  var modal = document.getElementById("param-modal-content");

  let allParams = SequenceParameters.findOne({envId: subj.envId}).parameters;

  modal.innerHTML += contributionHeaderTemplate("Enter a contribution for " + subj.info.name, subj.info.name, subjId);
  modal.innerHTML += contributionParameterTemplate(allParams, null, "Save Contribution");

  attachOptionSelection()
}


function editParamBoxes(seqId, subjId, envId) {
  $('#param-modal-content').children().remove();

  var subj = getStudent(subjId, envId);
  var seq = getSequence(seqId, envId);

  var modal = document.getElementById('param-modal-content');

  let allParams = SequenceParameters.findOne({envId:envId});
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

    let optionNodes = param.options.map((opt) => {
      let selected = "";

      if (sequence) {
        selected = sequence.info.parameters[param.label] === opt ? "checked" : ""
      }
      // console_log_conditional('creating options for student, ', student);
      return `
<input class="column has-text-centered subj-box-params optionSelection" type="radio" name="${param.label}" value="${opt}" id="${htmlClass(param.label + "__" + opt)}"${selected}>
<label for="${htmlClass(param.label + "__" + opt)}">${opt}</label>
            `
    }).join("");

    return `

            <div class="c--modal-student-header js-subject-labels">${param.label}</div>
            <div class="c--modal-student-options-container" data-parameter-name="${param.label}">
                ${optionNodes}
            </div>
        `
  }).join("");

  let seqId = sequence ? sequence._id.trim() : "";

  return `
            <!--<button id="randomize-selected" class="o&#45;&#45;standard-button c&#45;&#45;discourse-form__save-button">Randomize</button>-->
        <div class="boxes-wrapper">
        
        <form id="${saveBtn}-form">
            ${boxes}
            
          <div class="button-container">
              <button class="o--standard-button u--margin-zero-auto" type="submit" data-seq="${seqId}" id="${saveBtn}">
                  ${type}
              </button>
          </div>
        </form>
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