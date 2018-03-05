/*
* JS file for observation list.html
*/

Template.observationList.helpers({
  observation: function() {
      var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
      return obs;
  },
  hasObsMade: function() {
      var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
      if (obs.length === 0) {
          return true
      }
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

    var sequenceParams = SequenceParameters.findOne({'children.envId': this._id});
    var demographicParams = SubjectParameters.findOne({'children.envId': this._id});
    var observations = Observations.find({"envId": this._id}).fetch();

    if ($('#observationName').val() == "") {
      alert("Observation name required.");
      return;
    }

    if (sequenceParams === undefined || demographicParams === undefined) {
        alert("You must add students and parameters to the environment to continue to do the observation.")
        return;
    }

    if (observations.length === 0 ) {
        var confirmation = getConfirmation();
        if (confirmation) {
            Meteor.call('observationInsert', observation, function(error, result) {
              return 0;
            });

            $('#observationName').val('');
        }
    } else {
        Meteor.call('observationInsert', observation, function(error, result) {
          return 0;
        });

        $('#observationName').val('');
    }

    function getConfirmation() {
        var retVal = confirm("Are you sure? After the first observation is created, you will not be able to edit discourse dimensions or demographics.");
        if (retVal === true) {
            return true;
        }
        else {
            return false;
        }
    }
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


function createTableOfContributions() {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var seqs = Sequences.find({envId:envId}).fetch();
  var seqParams = SequenceParameters.find({'children.envId':envId}).fetch()[0];
  var parameterPairs = seqParams["children"]["parameterPairs"];

  var allParams = [];
  for (p = 0; p < parameterPairs; p++) {
    allParams.push(seqParams['children']['label' + p]);
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
        ${contributionRows}
    `
}

function contributionRowTemplate(seqItem, params) {
    let paramTemplate = params.map((param) => {
        return `
            <p class="contributions-grid-item">${param}</p>
        `
    }).join("");

    let paramValues = params.map((param) => {
        let data = seqItem.info[param] ? seqItem.info[param] : "n/a"
        return `
            <p class="contributions-grid-item">${data}</p>
        `
    }).join("");

    let time = `<p class="contributions-grid-item">${convertTime(Number(seqItem.time))}</p>`

    return `
        <div class="contributions-grid-container">
            <h3 class="contributions-modal-header">${seqItem.info.Name}</h3>
            <p class="contributions-modal-link edit-seq" data_id="${seqItem._id}" data_studentid="${seqItem.info.studentId}">Edit</p>
            <p class="contributions-modal-link delete-seq">Delete</p>
        </div>
        <div class="contributions-grid-item-container u--bold">
            <p class="contributions-grid-item">Time</p>
            ${paramTemplate}
        </div>
        <div class="contributions-grid-item-container">
            ${time}
            ${paramValues}
        </div>
    `
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
