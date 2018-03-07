/*
* JS file for edit_subjects.html
*/

Template.editSubjects.helpers({
  subject: function() {
    subs = Subjects.find({envId: this._id});
    return subs;
  },
  subjParameter: function() {

    var studentParams = SubjectParameters.find({'children.envId':this._id}).fetch();
    return studentParams;
  },
});

//Used to set up interactJS and get labels for students
// (and a session for some reason???)
Template.editSubjects.created = function() {
Session.set('envId', Router.current().params._envId);

// target elements with the "draggable" class
interact('.draggable')
  .draggable({
    // disable inertial throwing
    inertia: false,
    autoScroll: true,
    onmove: dragMoveListener,
    restrict: {
      restriction: 'parent'
    }

  });

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data_x/data_y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }


  // this is used later in the resizing and gesture demos
  window.dragMoveListener = dragMoveListener;
  /* INTERACTJS END */

};

// On rendering, get students and layout classroom with student boxes
Template.editSubjects.rendered = function() {
  $(document).keyup(function(e) {
     if (e.keyCode == 27) {
      $('#stud-param-modal').removeClass('is-active');
      $('#stud-data-modal').removeClass('is-active');
    }
  });
}

//
// Click events
//
Template.editSubjects.events({

  'click .back-head-params': function(e) {
    Router.go('observationList', {_envId:Router.current().params._envId});
  },

  //Stuff for student parameters modal

  'click .modal-close': function(e){
    $('#stud-param-modal').removeClass('is-active');
    $('#stud-data-modal').removeClass('is-active');
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function(e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-background': function(e){
    $('#stud-param-modal').removeClass('is-active');
    $('#stud-data-modal').removeClass('is-active');
    $('#help-env-modal').removeClass("is-active");
  },
  'click #add-student': function(e) {
    var envId = Router.current().params._envId
    var subjParams = SubjectParameters.findOne({'children.envId':envId});

    if ($.isEmptyObject(subjParams)) {
      alert("You must add demographic parameters before you can add a student!");
      return;
    }


    $('#param-modal-content').children().remove();

   $('#stud-param-modal').addClass('is-active');

    populateParamBoxes();

 },

  'click #save-subj-params': function(e) {

    // If using boxes
    name = $('#student-name').val();
    var info = {};
    var choices = [];
    var labels = [];
    choices.push(name);



    $('.subj-box-labels').each(function () {
      labels.push(this.textContent);
    });

    $('.chosen').each(function () {
      choices.push(this.textContent);
    });


    for (label in labels) {
        if (label == 0) {
          info['name'] = choices[label];
        } else {
          info[labels[label]] = choices[label];
        }
    }
    var students = Subjects.find({envId:Router.current().params._envId}).fetch();
    count = 0;
    _.each(students, function (s) {
      if (s['data_x'] == '0') {
        count++;
      }
    });

    y = count*30 + 30;
    var subject = {
      data_x: '0',
      data_y: String(y),
      envId: this._id,
      info: info
    };




    Meteor.call('subjectInsert', subject, function(error, result) {
     if (error) {
       alert(error.reason);
     } else {
      $('#stud-param-modal').removeClass('is-active');
     }
   });
 },
  'click .edit-stud' : function (e) {
    studId = $(e.target).attr('data_id');
    editParamBoxes(studId);

    $('#stud-data-modal').removeClass('is-active');
    $('#stud-param-modal').addClass('is-active');
  },
  'click #edit-remove-student': function(e) {
    createTableOfStudents();
    $('#stud-data-modal').addClass('is-active');
  },
  'click #save-locations': function(e) {
    var subjects = [];
    $('.draggable').each(function () {
      id = $(this).attr('id');
      x = $(this).attr('data-x');
      y = $(this).attr('data-y');
      subject = {'id': id, 'x': x, 'y': y};
      subjects.push(subject);
    });

    Meteor.call('subjectPositionUpdate', subjects, function(error, result) {
        if (error) {
          alert(error.reason);
        } else {
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
        Command: toastr["success"]("Save Successful", "Student locations saved as they currently are.")
        }
      });
  },

  'click .delete-student': function(e) {
    var result = confirm("Press 'OK' to delete this Subject.");
      subjId = $(e.target).attr("data_id");
      Meteor.call('subjectDelete', subjId, function(error, result) {
        return 0;
      });

      createTableOfStudents();
  },
  'click #edit-subj-params': function (e){
    subjId = $(e.target).attr('data_id');

    var info = {};
      info['name'] = $('.student-modal-head').attr('data_name');
      envId = Router.current().params._envId;
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

      var subject = {
        info: info,
        subId: subjId
      };

      Meteor.call('subjectUpdate', subject, function(error, result) {
       if (error) {
         alert(error.reason);
       } else {
        $('#stud-param-modal').removeClass('is-active');
       }
     });
    //This should happen at the end...
    $('#stud-param-modal').removeClass('is-active');
    createTableOfStudents()
    $('#stud-data-modal').addClass('is-active');
  }

});

//
// Support functions for creating tables/menus
//

function createTableOfStudents() {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var students = Subjects.find({envId:envId}).fetch();
  var subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
  var parameterPairs = subjParams["children"]["parameterPairs"];

  var allParams = [];
  for (p = 0; p<parameterPairs; p++) {
    allParams.push(subjParams['children']['label'+p]);
  }

  var modal = document.getElementById("data-modal-content");
  modal.innerHTML += contributionTableTemplate(students, allParams);
}

function contributionTableTemplate(students, parameters) {
    var params = parameters;
    var contributionRows = students.map((student) => {
        return contributionRowTemplate(student, params)
    }).join("");

    return `
        <div class="c--modal-header-container">
            <h3 class="c--modal-header-title">Student Roster</h3>
        </div>
        ${contributionRows}
    `
}

function contributionRowTemplate(student, params) {
    let paramValues = params.map((param) => {
        let data = student.info[param];
        return `
            <p class="contributions-grid-item-student">${param}<span>${data}</span></p>
        `
    }).join("");

    return `
        <div class="contributions-grid-container-student">
            <h3 class="contributions-modal-header">${student.info.name}</h3>
            <p class="contributions-modal-link edit-stud" data_id="${student._id}" data_studentid="${student.info.studentId}">Edit</p>
            <p class="contributions-modal-link delete-student" data_id="${student._id}" >Delete</p>
        </div>
        <div class="contributions-grid-item-container-student">
            ${paramValues}
        </div>
    `
}

function populateParamBoxes() {
  var envId = Router.current().params._envId
  subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = subjParams["children"]["parameterPairs"];

  var modal = $('#param-modal-content');

  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column is-2 has-text-centered subj-box-labels",
      text: "Name or Identifier for Student"
    }).appendTo(name);

    $('<input/>', {
        class: "column input",
        id: "student-name",
        type: "text",
        placeholder: "Eg, Joey or Male Student"
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
      text: subjParams['children']['label'+param]
    }).appendTo(wrap);

    var params = subjParams['children']['parameter'+param]
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
    id: "save-subj-params",
    text: "Add Subject"
  }).appendTo(modal);

}

function editParamBoxes(subjId) {
  $('#param-modal-content').children().remove();
  var envId = Router.current().params._envId
  subParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = subParams["children"]["parameterPairs"];
  var subj = Subjects.find({_id: subjId}).fetch()[0];
  var student = subj.info.name;

  var modal = $('#param-modal-content');

  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<h1/>", {
      class: "column is-12 has-text-centered title is-3 student-modal-head",
      text: "Editing Info for "+student,
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
      text: subParams['children']['label'+param]
    }).appendTo(wrap);

    var field = subParams['children']['label'+param];

    var params = subParams['children']['parameter'+param];
    var options = params.split(',');

    for (opt in options) {

        if (subj['info'][field] == options[opt]) {
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
    id: "edit-subj-params",
    data_id: subjId,
    text: "Save Revised Student Info"
  }).appendTo(modal);

}
