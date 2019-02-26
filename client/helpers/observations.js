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


function createTableOfContributions(obsId) {
  if (typeof obsId === 'undefined') {
    obsId = Router.current().params._obsId;
  }
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var seqs = Sequences.find({obsId:Router.current().params._obsId}).fetch();
  var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  var parameterPairs = seqParams["children"]["parameterPairs"];

  allParams = [];
  for (p = 0; p<parameterPairs; p++) {
    allParams.push(seqParams['children']['label'+p]);
  }

  var modal = document.getElementById("data-modal-content");
  modal.innerHTML += contributionTableTemplate(seqs, allParams);
}

function contributionTableTemplate(sequences, parameters) {
  var params = parameters;
  var contributionRows = sequences.map((sequence) => {
    return contributionRowTemplate(sequence, params)
  }).join("");

  return `
        <div class="c--modal-header-container">
            <h3 class="c--modal-header-title">Contribution Log</h3>
        </div>
        ${contributionRows}
    `
}


function contributionRowTemplate(seqItem, params) {
  let paramTemplate = params.map((param) => {
    return `
            <p class="o--modal-label contributions-grid-item">${param}</p>
        `
  }).join("");

  let paramValues = params.map((param) => {
    let data = seqItem.info[param] ? seqItem.info[param] : "n/a"
    return `
            <p class="o--modal-label contributions-grid-item">${data}</p>
        `
  }).join("");

  let time = `<p class="o--modal-label contributions-grid-item">${convertTime(Number(seqItem.time))}</p>`
  return `
        <div class="contributions-grid-container">
            <h3 class="contributions-modal-header">${seqItem.info.Name}</h3>
            <p class="o--toggle-links contributions-modal-link edit-seq" data_id="${seqItem._id}" data_studentid="${seqItem.info.studentId}">Edit</p>
            <p class="o--toggle-links contributions-modal-link delete-seq" data_id="${seqItem._id}" >Delete</p>
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
  var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  var parameterPairs = seqParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var studentName = subj.info.name;
  var modal = document.getElementById("param-modal-content");
  var howDefault = $("*[data_label='Contribution Defaults']").val();

  if (seqId) {
    modal.innerHTML += contributionHeaderTemplate("Edit contribution for " + studentName, studentName, subjId);
    modal.innerHTML += contributionParameterTemplate(seqParams, parameterPairs, seqId, "Update");
  }
  else {
    modal.innerHTML += contributionHeaderTemplate("Enter a contribution for " + studentName, studentName, subjId);
    modal.innerHTML += contributionParameterTemplate(seqParams, parameterPairs, seqId, "Save Contribution");
  }
  attachOptionSelection()
}



function contributionHeaderTemplate(type, studentName, subjId) {
  return `
        <div class="c--modal-header-container js-modal-header" data_id="${subjId}" data_name="${studentName}">
            <h3 class="c--modal-header-title">${type}</h3>
        </div>
    `
}

function contributionParameterTemplate(sequences, paramPairs, seqId, type) {
  let seq;

  if (seqId) {
    seq = Sequences.findOne({_id: seqId});
  }

  let saveBtn = type === "Save Contribution" ? "save-seq-params" : "edit-seq-params";
  let counter = Array(paramPairs).fill().map((e,i) => i);
  let boxes = counter.map((param) => {
    let params = sequences['children']['parameter' + param];
    let options = params.split(',');
    let field = sequences['children']['label' + param];
    let optionNodes = options.map((opt) => {
      let selected = "";
      if (field && seq) { selected = seq['info'][field] === opt.trim() ? "chosen" : "" }
      return `
                <div class="column has-text-centered subj-box-params ${selected} optionSelection">
                    ${opt}
                </div>
            `
    }).join("");
    return `
            <div class="c--modal-student-header js-subject-labels">${sequences['children']['label'+param]}</div>
            <div class="c--modal-student-options-container">
                ${optionNodes}
            </div>
        `
  }).join("");

  return `
        <div class="boxes-wrapper">
            ${boxes}
        </div>
        <div class="button-container">
            <button class="o--standard-button u--margin-zero-auto" data_seq="${seqId}" id="${saveBtn}">
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



function editParamBoxes(seqId, subjId) {
  var seq = Sequences.find({_id: seqId}).fetch()[0]
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId
  seqParams = SequenceParameters.find({'children.envId': envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var student = subj.info.name;

  var modal = $('#param-modal-content');

  var name = $("<div/>", {
    class: "columns  boxes-wrapper"
  }).appendTo(modal);

  var label = $("<h1/>", {
    class: "column is-12 has-text-centered title is-3 student-modal-head",
    text: "Editing Contribution for " + student,
    data_id: subjId,
    data_name: student
  }).appendTo(name);

  //
  //BOX CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param < parameterPairs; param++) {

    var wrap = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column is-2 has-text-centered subj-box-labels",
      text: seqParams['children']['label' + param]
    }).appendTo(wrap);

    var field = seqParams['children']['label' + param];

    var params = seqParams['children']['parameter' + param];
    var options = params.split(',');

    for (opt in options) {

      if (seq['info'][field] == options[opt]) {
        var option = $("<div/>", {
          class: "column has-text-centered subj-box-params chosen hoverable",
          text: options[opt]
        }).appendTo(wrap);
      } else {

        var option = $("<div/>", {
          class: "column has-text-centered subj-box-params hoverable",
          text: options[opt]
        }).appendTo(wrap);
      }
      option.click(function (e) {
        e.preventDefault();
        $(this).siblings().removeClass('chosen');
        if ($(this).hasClass('chosen')) {
          $(this).removeClass('chosen');
        } else {
          $(this).addClass('chosen');
        }
      });
    }//end for
  }//end for

  $("<button/>", {
    class: "button is-medium is-success",
    id: "edit-seq-params",
    data_seq: seqId,
    text: "Save Revised Contribution"
  }).appendTo(modal);

}

function editContribution(e) {
  // gtag('event', 'edit', {'event_category': 'sequences'});

  const seqId = $(e.target).attr('data_id');
  const myId = $(e.target).attr('data_studentId');

  editParamBoxes(seqId, myId);

  $('#seq-data-modal').removeClass('is-active');
  $('#seq-param-modal').addClass('is-active');
}

function deleteContribution(e) {
  var result = confirm("Press 'OK' to delete this Contribution.");
  if (result == false) {
    gtag('event', 'delete_cancelled', {'event_category': 'sequences'});
    return;
  }
  // const obsId = Router.current().params._obsId;
  const seqId = $(e.target).attr("data_id");
  Meteor.call('sequenceDelete', seqId, function (error, result) {
    gtag('event', 'delete', {'event_category': 'sequences'});
    return 0;
  });
  createTableOfContributions();
}

export {editParamBoxes, createTableOfContributions, populateParamBoxes, editContribution, deleteContribution}