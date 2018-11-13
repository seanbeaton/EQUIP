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

const grid_size = {
  x: 230,
  y: 60,
  width: 920,
  height: 1200,
  // grid_start_x: 82.5,
  // grid_start_y: 19,
  vert_offset: 12,
  horiz_offset: 25,
};

//Used to set up interactJS and get labels for students
// (and a session for some reason???)
Template.editSubjects.created = function () {
  Session.set('envId', Router.current().params._envId);

  // target elements with the "draggable" class
  interact('.draggable')
    .draggable({
      // disable inertial throwing
      snap: {
        targets: [
          function(xPos, yPos) {
            let parent_rect = $('.c--student-body__container')[0].getBoundingClientRect();
            let top_left = {
              x: parent_rect.x + window.scrollX + grid_size.horiz_offset,
              y: parent_rect.y + window.scrollY + grid_size.vert_offset,
            };
            let f = interact.createSnapGrid({x:grid_size.x, y: grid_size.y, range: Infinity, offset: top_left});
            return f(xPos, yPos);
          }
        ],
        range: Infinity,
        relativePoints: [{x: 0, y: 0}],
        // endOnly: true,
      },
      inertia: false,
      autoScroll: true,
      onmove: dragMoveListener,
      restrict: {
        restriction: '.drag-bounding-box',
        elementRect: { left: 0, right: 1, top: 0, bottom: 1 }
      }
    })
    .on('dragend', function(e) {
      const students = Subjects.find({envId: Router.current().params._envId}).fetch();

      let target = e.target;
      let dest_x = (parseFloat(target.getAttribute('data-x')) || 0);
      let dest_y = (parseFloat(target.getAttribute('data-y')) || 0);

      dest_x = Math.round(dest_x / parseFloat(grid_size.x)) * parseFloat(grid_size.x);
      dest_y = Math.round(dest_y / parseFloat(grid_size.y)) * parseFloat(grid_size.y);

      let occupying_student = findStudentAtLocation(students, dest_x, dest_y);
      if (occupying_student) {
        let new_pos = {
          x: parseFloat(target.getAttribute('data-orig-x')),
          y: parseFloat(target.getAttribute('data-orig-y')),
        };
        if (!new_pos.x || !new_pos.y) {
          new_pos = find_open_position(students)
        }
        moveStudent(document.getElementById(occupying_student._id), new_pos.x, new_pos.y)
      }
      target.classList.remove('dragging');
      target.removeAttribute('data-orig-x');
      target.removeAttribute('data-orig-y');
      saveStudentLocations();
    })
    .on('dragstart', function(e) {
      let target = e.target;
      target.classList.add('dragging');
      target.setAttribute('data-orig-x', target.getAttribute('data-x'));
      target.setAttribute('data-orig-y', target.getAttribute('data-y'));
    });

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data_x/data_y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // get the closest valid coords:
    x = Math.round(x / parseFloat(grid_size.x)) * parseFloat(grid_size.x);
    y = Math.round(y / parseFloat(grid_size.y)) * parseFloat(grid_size.y);

    moveStudent(target, x, y);
  }


  // this is used later in the resizing and gesture demos
  // window.dragMoveListener = dragMoveListener;
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
    saveNewSubject(this)
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
  'click #align-students': function(e) {
    const students = Subjects.find({envId: Router.current().params._envId}).fetch();
    align_all_students(students);
    saveStudentLocations()
  },
  'click #align-students-alpha': function(e) {
    const students = Subjects.find({envId: Router.current().params._envId}).fetch();
    align_all_students(students, true);
    saveStudentLocations();
  },
  'click #save-locations': function(e) {
    saveStudentLocations()
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


function find_open_position(students) {
  let x = 0,
      y = 0;
  let complete = false;
  while (!complete) {

    let element_in_location = findStudentAtLocation(students, x, y)
    if (!element_in_location) {
      complete = true;
    } else {
      if (x + grid_size.x >= grid_size.width) {
        x = 0;
        y += grid_size.y;
      } else {
        x += grid_size.x
      }
      if (x > 2000) {
        complete = true
      }
    }
  }
  return {x: x, y: y};
}

function align_all_students(students, alphabetically) {
  if (typeof alphabetically === 'undefined') {
    alphabetically = false;
  }

  students.forEach(function(student) {
    student.ignoreLocation = true;
  });
  students = students.sort(function(a, b) {
    if (!alphabetically) {
      if (a.data_y != b.data_y) {
        return a.data_y - b.data_y;
      }
      if (a.data_x != b.data_x) {
        return a.data_x - b.data_x;
      }
    }

    // Check case insensitive first
    if (a.info.name.toLowerCase() < b.info.name.toLowerCase()) {
      return -1
    }
    if (a.info.name.toLowerCase() > b.info.name.toLowerCase()) {
      return 1
    }
    // then insensitive
    if (a.info.name < b.info.name) {
      return -1
    }
    if (a.info.name > b.info.name) {
      return 1
    }
    return 0
  });
  for (let s_key in students) {
    if (!students.hasOwnProperty(s_key)) return;
    let open_pos = find_open_position(students);
    moveStudent(document.getElementById(students[s_key]._id), open_pos.x, open_pos.y);
    students[s_key].ignoreLocation = false;
    students[s_key].data_x = open_pos.x;
    students[s_key].data_y = open_pos.y;
  }
}

function moveStudent(student, x, y) {
  // if (typeof permanent === 'undefined') {
  //   permanent = 'true'
  // }

  // translate the element
  student.style.webkitTransform =
    student.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';
  // update the posiion attributes

  student.setAttribute('data-x', x);
  student.setAttribute('data-y', y);
  // if (permanent) {
  // }
}

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

function saveStudentLocations() {
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
        "preventDuplicates": true,
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
      Command: toastr["success"]("Student locations saved.")
    }
  });
}

function findStudentAtLocation(students, x, y) {
  return students.find(function(el) {
    if (el.ignoreLocation) {
      return false
    }
    return (parseFloat(el.data_x) === parseFloat(x) && parseFloat(el.data_y) === parseFloat(y))
  });
}

function saveNewSubject(env) {
  const students = Subjects.find({envId: Router.current().params._envId}).fetch();
  const numberOfStudents = students.length;
  let newStudentPositionX;
  let newStudentPositionY;

  if (numberOfStudents === 0) {
    newStudentPositionY = 0;
    newStudentPositionX = 0;
  } else {
    let open_position = find_open_position(students);
    // let yPosition = students[numberOfStudents - 1].data_y;
    // let xPosition = students[numberOfStudents - 1].data_x;
    newStudentPositionY = open_position.y;
    newStudentPositionX = open_position.x;
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
      alert("please make a selection");
      return;
    } else {
      choices.push(choice);
    }
  });

  for (let label in labels) {
    info[labels[label]] = choices[label];
  }

  let subject = {
    data_x: String(newStudentPositionX),
    data_y: String(newStudentPositionY),
    envId: env._id,
    info: info
  };

  Meteor.call('subjectInsert', subject, function(error, result) {
    if (error) {
      alert(error.reason);
    } else {
      $('#stud-param-modal').removeClass('is-active');
      $('.o--box-item#' + result._id).addClass('just-added');
      setTimeout(function() {
        $('.o--box-item#' + result._id).removeClass('just-added');
      }, 5000);
    }
  });
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
    let paramTemplate = params.map((param) => {
        return `
            <p class="o--modal-label contributions-grid-item">${param}</p>
        `
    }).join("");

    let paramValues = params.map((param) => {
        let data = student.info[param];
        return `
            <p class="o--modal-label contributions-grid-item">${data}</p>
        `
    }).join("");

    return `
        <div class="contributions-grid-container-student">
            <h3 class="contributions-modal-header">${student.info.name}</h3>
            <p class="o--toggle-links contributions-modal-link edit-stud" data_id="${student._id}" data_studentid="${student.info.studentId}">Edit</p>
            <p class="o--toggle-links contributions-modal-link delete-student" data_id="${student._id}" >Delete</p>
        </div>
        <div class="contributions-grid-item-container u--bold">
            ${paramTemplate}
        </div>
        <div class="contributions-grid-item-container">
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
