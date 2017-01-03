/*
* JS file for observation_environment_item.html
*/

Template.observationItem.events({
   'click #enter-class': function(e) {
     Router.go('observatory', {_envId: this.envId, _obsId: this._id});
   },
   'click #delete-obs-button': function(e) {
     var result = confirm("Deleting an observation will also delete all sequences taken in the specific observation. Press 'OK' to continue.");
     obsId = this._id
    if (result) {
      Meteor.call('observationDelete', obsId, function(error, result) {
        return 0;
      });
    }
  },
  'click .modal-close': function(e){
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
  },
  'click #view-edit-contributions':function (e){
    createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  },
  'click .edit-seq': function(e) {
    seqId = $(e.target).attr('data_id');
    myId = $(e.target).attr('data_studentId');
    console.log(myId);
    editParamBoxes(seqId, myId);
  
    $('#seq-data-modal').removeClass('is-active');
    $('#seq-param-modal').addClass('is-active');

  
  },
  'click .delete-seq': function(e) {
    var result = confirm("Press 'OK' to delete this Subject.");
      seqId = $(e.target).attr("data_id");
      Meteor.call('sequenceDelete', seqId, function(error, result) {
        return 0;
      });
      createTableOfContributions(this._id);

  },
  'click #edit-seq-params': function(e) {
    seqId = $(e.target).attr('data_seq');

    var info = {};
      info['studentId'] = $('.student-modal-head').attr('data_id');
      info['Name'] = $('.student-modal-head').attr('data_name');
      envId = Router.current().params._envId;
      obsId = Router.current().params._obsId;
      var choices = [];
      var labels = [];
      //Do this always in the case of editing from obs list

        $('.subj-box-labels').each(function () {
          labels.push(this.textContent);
        });

        $('.chosen').each(function () {
          choices.push(this.textContent);
        });
      
      for (label in labels) {
        info[labels[label]] = choices[label];
      }

      var sequence = {
        info: info,
        seqId: seqId
      };

      Meteor.call('sequenceUpdate', sequence, function(error, result) {
       if (error) {
         alert(error.reason);
       } else {
        $('#seq-param-modal').removeClass('is-active');
       }
     });
    //This should happen at the end...
    $('#seq-param-modal').removeClass('is-active');
    createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  }
 });

 Template.observationItem.helpers({

   needsSequences: function() {
     var obj = Sequences.find({envId: Router.current().params._envId}).fetch();
     console.log(this)
     return $.isEmptyObject(obj)?"light-green-pulse":"";
   }
  });

function createTableOfContributions(obsId) {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var seqs = Sequences.find({obsId: obsId}).fetch();
  console.log(seqs);
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];

  allParams = ['Edit','Name'];
  for (p = 0; p<parameterPairs; p++) {
    allParams.push(seqParams['children']['label'+p]);
  }
  allParams.push("Delete");

  var modal = $('#data-modal-content');

  var table = $('<table/>', {
    class: "table is-striped"
  }).appendTo(modal);
  // Create heading
  $('<thead/>', {}).appendTo(modal);
  var heading = $('<tr/>', {}).appendTo(table);

  for (pa in allParams) {
    $('<th/>', {
      text: allParams[pa]
    }).appendTo(heading);
  }
  var body = $('<tbody/>', {}).appendTo(table);
  //loop over each student
  for (s in seqs) {
    var row = $('<tr/>', {}).appendTo(table);
    //loop over each parameter
    for (p in allParams) {
      if (allParams[p] == "Delete") {
        //Add delete button
        var td = $('<td/>', {}).appendTo(row);
        var bye = $('<i/>', {
          class: "fa fa-times delete-seq",
          data_id: seqs[s]['_id']
        }).appendTo(td);
      } else if (allParams[p] == "Edit") {
        var td = $('<td/>', {}).appendTo(row);
        var bye = $('<i/>', {
          class: "fa fa-pencil-square-o edit-seq",
          data_id: seqs[s]['_id'],
          data_studentId: seqs[s]['info']['studentId']
        }).appendTo(td);
      }else {
        attr = seqs[s]['info'][allParams[p]]
        $('<td/>', {
          text: attr
        }).appendTo(row);
      }
    }
  }
}

function populateParamBoxes(subjId) {
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var student = subj.info.name;

  var modal = $('#param-modal-content');
  
  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<h1/>", {
      class: "column is-12 has-text-centered title is-3 student-modal-head",
      text: "Enter Contribution for "+student,
      data_id: subjId,
      data_name: student
    }).appendTo(name);

  //
  //BOX CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param<parameterPairs; param++) {
    if(seqParams['children']['toggle'+param] == "on"){
      continue;
    }
    var wrap = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column has-text-centered subj-box-labels",
      text: seqParams['children']['label'+param]
    }).appendTo(wrap);

    var params = seqParams['children']['parameter'+param]
    var options = params.split(',');

    for (opt in options) {
  
        var option = $("<div/>", {
          class: "column has-text-centered subj-box-params hoverable",
          text: options[opt]
        }).appendTo(wrap);

        option.click(function (e) {
          e.preventDefault();
          $(this).siblings().removeClass('chosen');
          $(this).addClass('chosen');
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
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var student = subj.info.name;

  var modal = $('#param-modal-content');
  
  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<h1/>", {
      class: "column is-12 has-text-centered title is-3 student-modal-head",
      text: "Editing Contribution for "+student,
      data_id: subjId,
      data_name: student
    }).appendTo(name);

  //
  //BOX CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param<parameterPairs; param++) {

    var wrap = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column has-text-centered subj-box-labels",
      text: seqParams['children']['label'+param]
    }).appendTo(wrap);

    var params = seqParams['children']['parameter'+param]
    var options = params.split(',');

    for (opt in options) {
  
        var option = $("<div/>", {
          class: "column has-text-centered subj-box-params hoverable",
          text: options[opt]
        }).appendTo(wrap);

        option.click(function (e) {
          e.preventDefault();
          $(this).siblings().removeClass('chosen');
          $(this).addClass('chosen');
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


