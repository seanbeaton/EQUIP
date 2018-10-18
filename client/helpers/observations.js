function createTableOfContributions(obsId) {
  const modal = $('#data-modal-content');

  modal.children().remove();
  const envId = Router.current().params._envId;
  const seqs = Sequences.find({obsId: obsId}).fetch();
  let seqParams = SequenceParameters.find({'children.envId': envId}).fetch()[0];
  const parameterPairs = seqParams["children"]["parameterPairs"];

  let allParams = ['Time', 'Name'];
  for (let p = 0; p < parameterPairs; p++) {
    allParams.push(seqParams['children']['label' + p]);
  }

  allParams.push("Edit");
  allParams.push("Delete");


  const table = $('<table/>', {
    class: "table is-striped"
  }).appendTo(modal);

  // Create heading
  $('<thead/>', {}).appendTo(modal);
  let heading = $('<tr/>', {}).appendTo(table);

  for (let pa in allParams) {
    $('<th/>', {
      text: allParams[pa]
    }).appendTo(heading);
  }
  const table_body = $('<tbody/>', {}).appendTo(table);
  //loop over each student
  for (let s in seqs) {
    const row = $('<tr/>', {}).appendTo(table_body);
    //loop over each parameter
    for (let p in allParams) {
      if (allParams[p] === "Delete") {
        //Add delete button
        let td = $('<td/>', {}).appendTo(row);
        let bye = $('<i/>', {
          class: "fa fa-times delete-seq",
          data_id: seqs[s]['_id']
        }).appendTo(td);
      } else if (allParams[p] === "Edit") {
        let td = $('<td/>', {}).appendTo(row);
        let bye = $('<i/>', {
          class: "fa fa-pencil-square-o edit-seq",
          data_id: seqs[s]['_id'],
          data_studentId: seqs[s]['info']['studentId']
        }).appendTo(td);
      } else if (allParams[p] === "Time") {
        let attr = seqs[s]['time'];
        $('<td/>', {
          text: convertTime(Number(attr))
        }).appendTo(row);
      } else {
        let attr = seqs[s]['info'][allParams[p]];
        $('<td/>', {
          text: attr
        }).appendTo(row);
      }
    }
  }
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

function populateParamBoxes(subjId) {
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
    text: "Enter Contribution for " + student,
    data_id: subjId,
    data_name: student
  }).appendTo(name);

  //
  //BOX CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param < parameterPairs; param++) {
    if (seqParams['children']['toggle' + param] == "on") {
      continue;
    }
    var wrap = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column is-2 has-text-centered subj-box-labels",
      text: seqParams['children']['label' + param]
    }).appendTo(wrap);

    var params = seqParams['children']['parameter' + param]
    var options = params.split(',');

    for (opt in options) {

      var option = $("<div/>", {
        class: "column has-text-centered subj-box-params hoverable",
        text: options[opt]
      }).appendTo(wrap);

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
    id: "save-seq-params",
    text: "Save Contribution"
  }).appendTo(modal);

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
  const seqId = $(e.target).attr('data_id');
  const myId = $(e.target).attr('data_studentId');

  editParamBoxes(seqId, myId);

  $('#seq-data-modal').removeClass('is-active');
  $('#seq-param-modal').addClass('is-active');
}

function deleteContribution(e) {
  var result = confirm("Press 'OK' to delete this Contribution.");
  if (result == false) {
    return;
  }
  const obsId = seq['obsId'];
  const seqId = $(e.target).attr("data_id");
  Meteor.call('sequenceDelete', seqId, function (error, result) {
    return 0;
  });
  createTableOfContributions(obsId);
}

export {editParamBoxes, createTableOfContributions, populateParamBoxes, editContribution, deleteContribution}