/*
* JS file for observation_environment_item.html
*/

Template.observationItem.events({
   'click #enter-class': function(e) {
     var obj1 = SubjectParameters.find({'children.envId': Router.current().params._envId}).fetch();
     var obj2 = SequenceParameters.find({'children.envId': Router.current().params._envId}).fetch();
     var obj3 = Subjects.find({envId: Router.current().params._envId}).fetch();

     if ($.isEmptyObject(obj1) || $.isEmptyObject(obj2) || $.isEmptyObject(obj3)) {
      alert('You must add students to the environment to continue to do the observation.');
      return;
     }
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
    var obj1 = Sequences.find({obsId: this._id}).fetch();
    if ($.isEmptyObject(obj1)) {
      alert('You do not have any sequences yet, please make sure your environment is fully setup.');
      return;
    }
    createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  },
  'click .edit-seq': function(e) {
    seqId = $(e.target).attr('data_id');
    myId = $(e.target).attr('data_studentId');
    editParamBoxes(seqId, myId);

    $('#seq-data-modal').removeClass('is-active');
    $('#seq-param-modal').addClass('is-active');


  },
  'click .delete-seq': function(e) {
    var result = confirm("Press 'OK' to delete this Subject.");
      seqId = $(e.target).attr("data_id");
      seq = Sequences.findOne({_id: seqId});
      obsId = seq['obsId'];
      Meteor.call('sequenceDelete', seqId, function(error, result) {
        return 0;
      });
      createTableOfContributions(obsId);

  },
  'click #edit-seq-params': function(e) {
    seqId = $(e.target).attr('data_seq');

    var info = {};
      info['studentId'] = $('.student-modal-head').attr('data_id');
      info['Name'] = $('.student-modal-head').attr('data_name');
      envId = Router.current().params._envId;
      obsId = this._id;
      var choices = [];
      var labels = [];
      //Do this always in the case of editing from obs list

        $('.subj-box-labels').each(function () {
          labels.push(this.textContent);
          var c = $(this).siblings('.chosen')[0];
          if (c) {
            choices.push(c.textContent);
          } else {
            choices.push(null);
          }
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
    seq = Sequences.findOne({_id: seqId});
    obsId = seq['obsId'];
    $('#seq-param-modal').removeClass('is-active');
    createTableOfContributions(obsId);
    $('#seq-data-modal').addClass('is-active');
  }
 });

 Template.observationItem.helpers({

   needsSequences: function() {
     var obj = Sequences.find({envId: Router.current().params._envId}).fetch();
     return $.isEmptyObject(obj)?"light-green-pulse":"";
   }
  });

function createTableOfContributions(obsId) {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var seqs = Sequences.find({obsId: obsId}).fetch();
  var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  var parameterPairs = seqParams["children"]["parameterPairs"];

  var allParams = ['Edit','Name', 'Time'];
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
      }else if (allParams[p] == "Time") {
        attr = seqs[s]['time']
        $('<td/>', {
          text: convertTime(Number(attr))
        }).appendTo(row);
      }else {
        attr = seqs[s]['info'][allParams[p]]
        $('<td/>', {
          text: attr
        }).appendTo(row);
      }
    }
  }
}

function convertTime(secs) {
  var hours = Math.floor(secs / (60*60));
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
  final_str = ''+hours+':'+minutes+':'+seconds;
  return final_str;
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
      class: "column is-2 has-text-centered subj-box-labels",
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
          if ( $(this).hasClass('chosen') ){
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
      class: "column is-2 has-text-centered subj-box-labels",
      text: seqParams['children']['label'+param]
    }).appendTo(wrap);

    var field = seqParams['children']['label'+param];

    var params = seqParams['children']['parameter'+param];
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
          if ( $(this).hasClass('chosen') ){
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
