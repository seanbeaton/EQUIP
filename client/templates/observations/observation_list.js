/*
* JS file for observation list.html
*/

Template.observationList.helpers({
  observation: function() {
    var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
    return obs;
  }
});

Template.observationList.events({
'click .back-head-params': function(e) {
   e.preventDefault();
   Router.go('environmentList');
 },
 'click #edit-params-button': function (e){
    e.preventDefault();
    Router.go('editSubjectParameters', {_envId:this._id});
 },
 'click #edit-students-button': function(e) {
     e.preventDefault();
     Router.go('editSubjects', {_envId:this._id});
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click #obs-create-button': function(e) {
    $('#obs-create-modal').addClass("is-active");
  },
  'click #obs-close-modal': function(e) {
    $('#obs-create-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#obs-create-modal').removeClass("is-active");
    $('#help-env-modal').removeClass("is-active");
  },
  'click #save-obs-name': function(e) {

    var observation = {
      name: $('#observationName').val(),
      envId: this._id,
      timer: 0
    };

    if ($('#observationName').val() == "") {
      alert("Observation name required.");
      return;
    }

    Meteor.call('observationInsert', observation, function(error, result) {
      return 0;
    });

    $('#observationName').val('');
  },
   'click .delete-seq': function(e) {
    var result = confirm("Press 'OK' to delete this Subject.");
      seqId = $(e.target).attr("data_id");
      Meteor.call('sequenceDelete', seqId, function(error, result) {
        return 0;
      });
      createTableOfContributions(this._id);

  },
  'click .modal-close': function(e){
    $('#seq-param-modal').removeClass('is-active');
    $('#seq-data-modal').removeClass('is-active');
  },
  'click #show-all-observations':function (e){
    createTableOfContributions(this._id);
    $('#seq-data-modal').addClass('is-active');
  },
});

Template.observationList.rendered = function() {

}

function createTableOfContributions() {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var seqs = Sequences.find({envId:envId}).fetch();
  seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = seqParams["children"]["parameterPairs"];

  allParams = ['Name', "Time", "Observation"];
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
      } else if (allParams[p] == "Time") {
        attr = seqs[s]['time']
        $('<td/>', {
          text: convertTime(Number(attr))
        }).appendTo(row);
      } else if (allParams[p] == "Observation") {
        attr = seqs[s]['obsName'];
        $('<td/>', {
          text: attr
        }).appendTo(row);
      } else {
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
