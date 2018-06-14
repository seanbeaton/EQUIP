/*
* JS file for edit_subjects.html
*/

Template.editSubjects.helpers({
    subject: function() {
        subs = Subjects.find({envId: this._id});
        return subs;
    },
    classRoomName: function() {
        return this.envName;
    }
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
    populateParamBoxes(envId);
 },

  'click #save-subj-params': function(e) {
    const students = Subjects.find({envId: Router.current().params._envId}).fetch();
    const numberOfStudents = students.length;
    let newStudentPositionX;
    let newStudentPositionY;

    if (numberOfStudents === 0) {
        newStudentPositionY = 180;
        newStudentPositionX = 0;
    } else {
        let yPosition = students[numberOfStudents - 1].data_y;
        let xPosition = students[numberOfStudents - 1].data_x;
        newStudentPositionY = parseInt(yPosition) > 1000 ?  180 : parseInt(yPosition) + 75;
        newStudentPositionX = parseInt(yPosition) > 1000 ?  parseInt(xPosition) + 250 : xPosition;
    }

    const name = $('#student-name').val().trim();

    if (name.length === 0 ) {
        alert("Please enter a name");
        return;
    }

    var info = {};
    var choices = [];
    var labels = ["name"];
    choices.push(name);

    $('.js-subject-labels').each(function () {
      labels.push(this.textContent);
    });

    $('.chosen').each(function () {
      let choice = this.textContent.replace(/\n/ig, '').trim();
      if (choice.length === 0) {
          alert("please make a selection")
          return;
      } else {
          choices.push(choice);
      }
    });

    for (label in labels) {
        info[labels[label]] = choices[label];
    }

    var subject = {
      data_x: String(newStudentPositionX),
      data_y: String(newStudentPositionY),
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

    if (result === true) {
        var subjId = $(e.target).attr("data_id");

        Meteor.call('subjectDelete', subjId, function(error, result) {
            return 0;
        });

        createTableOfStudents();
    } else {
        return;
    }
  },
  'click #edit-subj-params': function (e){
    var subjId = $(e.target).attr('data_id');
    var info = {};
    info['name'] = $('.js-modal-header').attr('data_name');
    var envId = Router.current().params._envId;
    var choices = [];
    var labels = [];
    //Do this always in the case of editing from obs list

    $('.js-subject-labels').each(function () {
        labels.push(this.textContent);
    });

    $('.chosen').each(function () {
      let choice = this.textContent.replace(/\n/ig, '').trim();
      choices.push(choice);
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
            <p class="o--toggle-links contributions-modal-link edit-stud" data_id="${student._id}" data_studentid="${student.info.studentId}">Edit</p>
            <p class="o--toggle-links contributions-modal-link delete-student" data_id="${student._id}" >Delete</p>
        </div>
        <div class="contributions-grid-item-container-student">
            ${paramValues}
        </div>
    `
}

// Saves a new student
function populateParamBoxes(envId) {
    var subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
    var parameterPairs = subjParams["children"]["parameterPairs"];
    var modal = document.getElementById("param-modal-content");

    modal.innerHTML += studentHeaderTemplate("Add a Student");
    modal.innerHTML += studentInputTemplate();
    modal.innerHTML += studentParameterTemplate(subjParams, parameterPairs, null, "Add Student");
    attachOptionSelection()
}

// Edits student
function editParamBoxes(subjId) {
    $('#param-modal-content').children().remove();
    let envId = Router.current().params._envId
    let subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
    let parameterPairs = subjParams["children"]["parameterPairs"];
    let subj = Subjects.find({_id: subjId}).fetch()[0];
    let student = subj.info.name;
    let modal = document.getElementById("param-modal-content");

    modal.innerHTML += studentHeaderTemplate(`Edit ${student}`, student);
    modal.innerHTML += studentParameterTemplate(subjParams, parameterPairs, subj, "Edit Student");
    attachOptionSelection()
}

function studentHeaderTemplate(type, student) {
    let studentName = student ? student : "";
    return `
        <div class="c--modal-header-container js-modal-header" data_name="${studentName}">
            <h3 class="c--modal-header-title">${type}</h3>
        </div>
    `
}

function studentInputTemplate() {
    return `
        <div class="boxes-wrapper">
            <div class="c--modal-student-header">
                <p>Name / Identifier for Student</p>
            </div>
            <input class="c--modal-student-input" id="student-name" type="text" placeholder="Type Student's First Name, Initials, or Pseudonym">
        </div>
    `
}

function studentParameterTemplate(subjects, paramPairs, student, type) {
    let saveBtn = type === "Add Student" ? "save-subj-params" : "edit-subj-params";
    let counter = Array(paramPairs).fill().map((e,i) => i);
    let studentId = student ? student._id.trim() : "";
    let boxes = counter.map((param) => {
        let params = subjects['children']['parameter' + param];
        let options = params.split(',');
        let field = subjects['children']['label' + param];
        let optionNodes = options.map((opt) => {
            let selected = "";

            if (field && student) { selected = student['info'][field] === opt ? "chosen" : "" }

            return `
                <div class="column has-text-centered subj-box-params ${selected} optionSelection">
                    ${opt}
                </div>
            `
        }).join("");
        return `
            <div class="c--modal-student-header js-subject-labels">${subjects['children']['label'+param]}</div>
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
            <button class="o--standard-button u--margin-zero-auto" id="${saveBtn}" data_id="${studentId}">
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
