/*
* JS file for edit_subjects.html
*/

import {console_log_conditional} from "/helpers/logging"

Template.editSubjects.helpers({
  subject: function () {
    subs = Subjects.find({envId: this._id});
    return subs;
  },
  classRoomName: function () {
    return this.envName;
  },
  envId: function () {
    return this._id;
  }
});

let cols = 9;
let rows = 30;
let row_height = 40;
let col_width = 100;
let gap = 6;

export const subject_grid_size = {
  x: col_width + gap,
  y: row_height + gap,
  width: cols * (col_width + gap) - gap,
  height: rows * (row_height + gap) - gap,
  // grid_start_x: 82.5,
  // grid_start_y: 19,
  gap: gap,
  vert_offset: gap,
  horiz_offset: gap,
};

//Used to set up interactJS and get labels for students
Template.editSubjects.created = function () {
  // target elements with the "draggable" class

  interact('.draggable')
    .draggable({
      // disable inertial throwing
      snap: {
        targets: [
          function (xPos, yPos) {
            let $students_area = $('.c--student-body__container');
            $students_area.height(subject_grid_size.height);
            $students_area.width(subject_grid_size.width);
            let parent_rect = $students_area[0].getBoundingClientRect();
            let top_left = {
              x: parent_rect.x + window.scrollX + subject_grid_size.gap,
              y: parent_rect.y + window.scrollY + subject_grid_size.gap,
            };
            let f = interact.createSnapGrid({x: subject_grid_size.x, y: subject_grid_size.y, range: Infinity, offset: top_left});
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
        elementRect: {left: 0, right: 1, top: 0, bottom: 1}
      }
    })
    .on('dragend', function (e) {
      let target = e.target;
      if (!target.classList.contains('dragging')) {
        // pseudo once to stop this event triggering multiple times causing issues.
        return;
      }
      target.classList.remove('dragging');

      const students = Subjects.find({envId: Router.current().params._envId}).fetch();
      let dest_x = (parseFloat(target.getAttribute('data-x')) || 0);
      let dest_y = (parseFloat(target.getAttribute('data-y')) || 0);

      dest_x = Math.round(dest_x / parseFloat(subject_grid_size.x)) * parseFloat(subject_grid_size.x);
      dest_y = Math.round(dest_y / parseFloat(subject_grid_size.y)) * parseFloat(subject_grid_size.y);

      let occupying_student = findStudentAtLocation(students, dest_x, dest_y);
      if (occupying_student) {
        let new_pos = {
          x: parseFloat(target.getAttribute('data-orig-x')),
          y: parseFloat(target.getAttribute('data-orig-y')),
        };
        if (!new_pos.x || !new_pos.y) {
          new_pos = find_open_position(students)
        }
        moveStudent(occupying_student._id, new_pos.x, new_pos.y)
      }
      target.removeAttribute('data-orig-x');
      target.removeAttribute('data-orig-y');
      saveStudentLocations();
    })
    .on('dragstart', function (e) {
      let target = e.target;
      target.classList.add('dragging');
      target.setAttribute('data-orig-x', target.getAttribute('data-x'));
      target.setAttribute('data-orig-y', target.getAttribute('data-y'));
    });

  function dragMoveListener(event) {
    const target = event.target;
    // keep the dragged position in the data_x/data_y attributes
    let x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // get the closest valid coords:
    x = Math.round(x / parseFloat(subject_grid_size.x)) * parseFloat(subject_grid_size.x);
    y = Math.round(y / parseFloat(subject_grid_size.y)) * parseFloat(subject_grid_size.y);

    moveStudent(target.getAttribute('data-id'), x, y);
  }
};

// On rendering, get students and layout classroom with student boxes
Template.editSubjects.rendered = function () {
  $(document).keyup(function (e) {
    if (e.keyCode === 27) {
      $('#stud-param-modal').removeClass('is-active');
      $('#stud-data-modal').removeClass('is-active');
    }
  });
  // ensure_student_alignment();

}

//
// Click events
//
Template.editSubjects.events({
  //Stuff for student parameters modal
  'click .modal-close': function (e) {
    $('#stud-param-modal').removeClass('is-active');
    $('#stud-data-modal').removeClass('is-active');
  },
  'click .help-button': function (e) {
    $('#help-env-modal').addClass("is-active");
  },
  'click #help-close-modal': function (e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-card-foot .button': function (e) {
    $('#help-env-modal').removeClass("is-active");
  },
  'click .modal-background': function (e) {
    $('#stud-param-modal').removeClass('is-active');
    $('#stud-data-modal').removeClass('is-active');
    $('#help-env-modal').removeClass("is-active");
  },
  'click #add-student': function (e) {
    const envId = Router.current().params._envId;
    const subjParams = SubjectParameters.findOne({'envId': envId});

    if ($.isEmptyObject(subjParams)) {
      alert("You must add demographic parameters before you can add a student!");
      return;
    }

    $('#param-modal-content').children().remove();
    $('#stud-param-modal').addClass('is-active');
    populateParamBoxes(envId);
  },

  'click #save-subj-params': function (e) {
    $('#stud-param-modal').addClass('is-processing');
    let callback = function () {
      setTimeout(function () {
        $('#stud-param-modal').removeClass('is-processing');
      }, 500);
    }
    saveNewSubject(this, callback)
  },
  'click .edit-stud': function (e) {
    let target = $(e.target)
    if (!target.hasClass('edit-stud')) {
      target = target.parents('.edit-stud');
    }
    let studId = target.attr('data-id');
    console_log_conditional('e', e);
    editParamBoxes(studId);

    $('#stud-data-modal').removeClass('is-active');
    $('#stud-param-modal').addClass('is-active');
  },
  'click #edit-remove-student': function (e) {
    createTableOfStudents();
    $('#stud-data-modal').addClass('is-active');
  },
  'click #align-students': function (e) {
    const students = Subjects.find({envId: Router.current().params._envId}).fetch();
    align_all_students(students, false, moveStudent);
    saveStudentLocations()
  },
  'click #align-students-alpha': function (e) {
    const students = Subjects.find({envId: Router.current().params._envId}).fetch();
    align_all_students(students, true, moveStudent);
    saveStudentLocations();
  },
  'click #save-locations': function (e) {
    saveStudentLocations()
  },

  'click .delete-student': function (e) {
    var result = confirm("Press 'OK' to delete this Subject.");

    if (result === true) {
      var subjId = $(e.target).attr("data-id");

      Meteor.call('subjectDelete', subjId, function (error, result) {
        return 0;
      });

      createTableOfStudents();
    }
    else {
      return;
    }
  },
  'click #edit-subj-params': function (e) {
    $('#stud-param-modal').addClass('is-processing');

    let callback = function () {
      setTimeout(function () {
        $('#stud-param-modal').removeClass('is-processing');
        $('#stud-data-modal').addClass('is-active');
        createTableOfStudents();
      }, 500);
    }
    editStudent(e, callback);
    // $('#stud-param-modal').removeClass('is-active');
  },
  'click #edit-subj-params-exit': function (e) {
    $('#stud-param-modal').addClass('is-processing');
    let callback = function () {
      setTimeout(function () {
        $('#stud-param-modal').removeClass('is-processing');
      }, 500);
    }
    editStudent(e, callback);
    // $('#stud-param-modal').removeClass('is-active');
    // createTableOfStudents();
    // $('#stud-data-modal').addClass('is-active');
  }
});

function editStudent(e, callback) {
  var subjId = $(e.target).attr('data-id');

  //Do this always in the case of editing from obs list

  let form_incomplete = false;

  let info = {};
  info.name = $('#student-name').val();

  info.demographics = {};

  let incomplete_parameters = [];
  $('.c--modal-student-options-container').each(function () {
    let parameter_name = this.getAttribute('data-parameter-name');
    let parameter_choice = $('.chosen', $(this)).text().replace(/\n/ig, '').trim();
    if (parameter_choice.length === 0) {
      incomplete_parameters.push(parameter_name);
      form_incomplete = true;
    }
    else {
      info.demographics[parameter_name] = parameter_choice
    }
  });

  if (form_incomplete) {
    alert(`No selection made for ${incomplete_parameters.join(', ')}`);
    if (typeof callback === 'function') {
      callback()
    }
    return;
  }

  let subject = {
    info: info,
    id: subjId
  };

  Meteor.call('subjectUpdate', subject, function (error, result) {
    if (error) {
      alert(error.reason);
    }
  });

  if (typeof callback === 'function') {
    callback()
  }
  $('#stud-param-modal').removeClass('is-active');
}

export let find_open_position = function (students) {
  let x = 0,
    y = 0;
  let complete = false;
  while (!complete) {
    let element_in_location = findStudentAtLocation(students, x, y)
    if (!element_in_location) {
      complete = true;
    }
    else {
      if (x + subject_grid_size.x >= subject_grid_size.width) {
        x = 0;
        y += subject_grid_size.y;
      }
      else {
        x += subject_grid_size.x
      }
      if (x > 2000) {
        complete = true
      }
    }
  }
  return {x: x, y: y};
}

export let student_is_aligned_to_grid = function(student) {
  const old_spacing_x = 230;
  const old_spacing_y = 60;

  const new_spacing_x = col_width + gap;
  const new_spacing_y = row_height + gap;

  if (student.data_x % new_spacing_x !== 0 || student.data_y % new_spacing_y !== 0) {
    console.log('student not aligned to grid', 'student.data_x / new_spacing_x !== 0 ', student.data_x / new_spacing_x, student.data_y / new_spacing_y)
  }
  return !(student.data_x % new_spacing_x !== 0 || student.data_y % new_spacing_y !== 0 );
}
//
// export let ensure_student_alignment = function() {
//   const old_spacing_x = 230;
//   const old_spacing_y = 60;
//
//   const new_spacing_x = col_width + gap;
//   const new_spacing_y = row_height + gap;
//
//   let students_updated = 0;
//   Subjects.find().forEach(function(subject) {
//     if (student_is_aligned_to_grid(subject)) {
//       return;
//     }
//     students_updated++;
//     let original_x_cardinal = Math.round(subject.data_x / old_spacing_x);
//     let original_y_cardinal = Math.round(subject.data_y / old_spacing_y);
//     let new_x = original_x_cardinal * new_spacing_x * 2;
//     let new_y = original_y_cardinal * new_spacing_y * 2;
//     moveStudent(subject._id, new_x, new_y)
//     // Subjects.update({'_id': subject._id}, {$set: {
//     //     'data_x': original_x_cardinal * new_spacing_x * 2,
//     //     'data_y': original_y_cardinal * new_spacing_y * 2
//     //   }});
//   });
//   if (students_updated > 0) {
//     alert('Your student positions have been updated to match the new grid layout.')
//     saveStudentLocations();
//   }
// }

export let align_all_students = function (students, alphabetically, callback) {
  console_log_conditional('students', students);
  if (typeof alphabetically === 'undefined') {
    alphabetically = false;
  }

  students.forEach(function (student) {
    student.ignoreLocation = true;
  });
  students = students.sort(function (a, b) {
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
    if (!students.hasOwnProperty(s_key)) {
      continue;
    }

    let open_pos = find_open_position(students);
    if (typeof callback === 'function') {
      callback(students[s_key]._id, open_pos.x, open_pos.y);
    }
    students[s_key].ignoreLocation = false;
    students[s_key].data_x = open_pos.x;
    students[s_key].data_y = open_pos.y;
  }
}

function moveStudent(subId, x, y) {
  let student = document.getElementById(subId)
  // if (typeof permanent === 'undefined') {
  //   permanent = 'true'
  // }

  // translate the element
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
  let envId = Router.current().params._envId;
  let students = Subjects.find({envId: envId}).fetch();

  let allParams = SubjectParameters.findOne({envId: envId}).parameters;

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

  Meteor.call('subjectPositionUpdate', subjects, function (error, result) {
    if (error) {
      alert(error.reason);
    }
    else {
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
  return students.find(function (el) {
    if (el.ignoreLocation) {
      return false
    }
    return (parseFloat(el.data_x) === parseFloat(x) && parseFloat(el.data_y) === parseFloat(y))
  });
}

function saveNewSubject(env, callback) {
  const students = Subjects.find({envId: Router.current().params._envId}).fetch();
  const numberOfStudents = students.length;
  let newStudentPositionX;
  let newStudentPositionY;

  if (numberOfStudents === 0) {
    newStudentPositionY = 0;
    newStudentPositionX = 0;
  }
  else {
    let open_position = find_open_position(students);
    // let yPosition = students[numberOfStudents - 1].data_y;
    // let xPosition = students[numberOfStudents - 1].data_x;
    newStudentPositionY = open_position.y;
    newStudentPositionX = open_position.x;
  }

  const name = $('#student-name').val().trim();

  let form_incomplete = false;

  if (name.length === 0) {
    alert("Please enter a name");
    form_incomplete = true;
  }

  let info = {};

  info.name = name;

  info.demographics = {};

  let incomplete_parameters = [];
  $('.c--modal-student-options-container').each(function () {
    let parameter_name = this.getAttribute('data-parameter-name');
    let parameter_choice = $('.chosen', $(this)).text().replace(/\n/ig, '').trim();
    if (parameter_choice.length === 0) {
      incomplete_parameters.push(parameter_name);
      form_incomplete = true;
    }
    else {
      info.demographics[parameter_name] = parameter_choice
    }
  });

  if (form_incomplete) {
    alert(`No selection made for ${incomplete_parameters.join(', ')}`);
    if (typeof callback === 'function') {
      callback()
    }
    return;
  }

  let subject = {
    data_x: String(newStudentPositionX),
    data_y: String(newStudentPositionY),
    envId: env._id,
    info: info
  };

  Meteor.call('subjectInsert', subject, function (error, result) {
    if (error) {
      alert(error.reason);
    }
    else {
      $('.o--box-item#' + result._id).addClass('just-added');
      setTimeout(function () {
        $('.o--box-item#' + result._id).removeClass('just-added');
      }, 5000);
    }
  });

  if (typeof callback === 'function') {
    callback()
  }
  $('#stud-param-modal').removeClass('is-active');
}

function contributionTableTemplate(students, parameters) {
  var contributionRows = students.map((student) => {
    return contributionRowTemplate(student, parameters)
  }).join("");

  return `
        <div class="c--modal-header-container">
            <h3 class="c--modal-header-title">Student Roster</h3>
        </div>
        ${contributionRows}
    `
}

function contributionRowTemplate(student, params) {
  console_log_conditional(student, params);
  let paramTemplate = params.map((param) => {
    return `
            <p class="o--modal-label contributions-grid-item">${param.label}</p>
        `
  }).join("");

  let paramValues = params.map((param) => {
    let data = student.info.demographics[param.label] ? student.info.demographics[param.label] : 'Not Specified';
    return `
            <p class="o--modal-label contributions-grid-item">${data}</p>
        `
  }).join("");

  return `
        <div class="contributions-grid-container-student">
            <h3 class="contributions-modal-header">${student.info.name}</h3>
            <p class="o--toggle-links contributions-modal-link edit-stud" data-id="${student._id}" data-student-id="${student.info.studentId}">Edit</p>
            <p class="o--toggle-links contributions-modal-link delete-student" data-id="${student._id}" >Delete</p>
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
  var modal = document.getElementById("param-modal-content");

  let allParams = SubjectParameters.findOne({envId: envId}).parameters;

  modal.innerHTML += studentHeaderTemplate("Add a Student");
  modal.innerHTML += studentInputTemplate();
  modal.innerHTML += studentParameterTemplate(allParams, null, "Add Student");
  attachOptionSelection()
  $('.student-name-field').focus()
}

// Edits student
function editParamBoxes(subjId) {
  $('#param-modal-content').children().remove();
  let modal = document.getElementById("param-modal-content");

  let subj = Subjects.findOne({_id: subjId});
  let allParams = SubjectParameters.findOne({envId: subj.envId}).parameters;
  let student = subj.info.name;

  modal.innerHTML += studentHeaderTemplate(`Edit ${student}`, student);
  modal.innerHTML += studentInputTemplate(student);
  modal.innerHTML += studentParameterTemplate(allParams, subj, "Save Student");
  attachOptionSelection()
}

function studentHeaderTemplate(type, student) {
  let studentName = student ? student : "";
  return `
        <div class="c--modal-header-container js-modal-header" data-name="${studentName}">
            <h3 class="c--modal-header-title">${type}</h3>
        </div>
    `
}

function studentInputTemplate(name) {
  return `
        <div class="boxes-wrapper">
            <div class="c--modal-student-header">
                <p>Name / Identifier for Student</p>
            </div>
            <input value="${name ? name : ''}" class="c--modal-student-input student-name-field" id="student-name" type="text" placeholder="Type Student's First Name, Initials, or Pseudonym">
        </div>
    `
}

function studentParameterTemplate(allParams, student, type) {
  let saveBtn = type === "Add Student" ? "save-subj-params" : "edit-subj-params";
  let studentId = student ? student._id.trim() : "";

  console_log_conditional(allParams);
  let boxes = allParams.map((param) => {
    console_log_conditional('param', param);
    let optionNodes = param.options.map((opt) => {
      let selected = "";

      if (student) {
        selected = student.info.demographics[param.label] === opt ? "chosen" : ""
      }
      console_log_conditional('creating options for student, ', student);

      return `
                <div class="column has-text-centered subj-box-params ${selected} optionSelection">
                    ${opt}
                </div>
            `
    }).join("");

    return `
            <div class="c--modal-student-header js-subject-labels">${param.label}</div>
            <div class="c--modal-student-options-container" data-parameter-name="${param.label}">
                ${optionNodes}
            </div>
        `
  }).join("");

  let exit_save_button = '';
  if (saveBtn === 'edit-subj-params') {
    exit_save_button = `
        <button class="o--standard-button u--margin-zero-auto" id="${saveBtn}-exit" data-id="${studentId}">
            ${type} and Close
        </button>
      `
  }
  return `
      <div class="boxes-wrapper">
          ${boxes}
      </div>
      <div class="button-container button-container--horizontal">
          <button class="o--standard-button u--margin-zero-auto" id="${saveBtn}" data-id="${studentId}">
              ${type}
          </button>
          ${exit_save_button}
      </div>
  `
}

function attachOptionSelection() {
  var allNodes = document.querySelectorAll(".optionSelection");
  [...allNodes].forEach((node) => {
    node.addEventListener("click", handleOptionSelect);
  });
}

var handleOptionSelect = function () {
  $(this).siblings().removeClass('chosen');
  if ($(this).hasClass('chosen')) {
    $(this).removeClass('chosen');
  }
  else {
    $(this).addClass('chosen');
  }
}
