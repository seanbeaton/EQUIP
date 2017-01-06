/*
* JS file for edit_subjects.html
*/

Template.editSubjects.helpers({
  subject: function() {
    return Subjects.find({envId: this._id});
  },
  subjParameter: function() {

    var studentParams = SubjectParameters.find({'children.envId':this._id}).fetch();
    console.log(studentParams);
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
    // enable inertial throwing
    inertia: true,
    autoScroll: true,
    onmove: dragMoveListener,
 
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
  'click #add-student': function(e) {
    $('#param-modal-content').children().remove();

   $('#stud-param-modal').addClass('is-active');
   if ($('#selection-style').val() == "Boxes"){
      populateParamBoxes();
   } else {
      populateParamDropdown();
   }
 },

  'click #save-subj-params': function(e) {

    // If using boxes
    name = $('#student-name').val();
    var info = {};
    var choices = [];
    var labels = [];
    choices.push(name);

    if ($('#selection-style').val() == "Boxes"){

      $('.subj-box-labels').each(function () {
        console.log(this.textContent);
        labels.push(this.textContent);
      });

      $('.chosen').each(function () {
        choices.push(this.textContent);
      });
    } else {
    // if using dropdowns
    $('.subj-drop-labels').each(function () {
        labels.push(this.textContent);
      });

      $('.subj-drop-params option:selected').each(function () {
        choices.push($(this).val());
      });
    }

    for (label in labels) {
        if (label == 0) {
          info['name'] = choices[label];
        } else {
          info[labels[label]] = choices[label];
        }
    }

    var subject = {
      data_x: '',
      data_y: '',
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

  'click #editSubjects': function(e) {
    propigateSubjectTableBody();
    $('#editSubjPopup').modal({
      keyboard: true,
      show: true
    });
  },
  'click .delete-subject': function(e) {
    var result = confirm("Press 'OK' to delete this Subject.");
      subjId = $(e.target).attr("data_id");
      Meteor.call('subjectDelete', subjId, function(error, result) {
        return 0;
      });

      createTableOfStudents();
  }

});

//
// Support functions for creating tables/menus
//

function createTableOfStudents() {
  $('#data-modal-content').children().remove();
  var envId = Router.current().params._envId
  var students = Subjects.find({envId:envId}).fetch();
  subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = subjParams["children"]["parameterPairs"];
  console.log(students);

  allParams = ['name'];
  for (p = 0; p<parameterPairs; p++) {
    allParams.push(subjParams['children']['label'+p]);
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
  for (s in students) {
    var row = $('<tr/>', {}).appendTo(table);
    //loop over each parameter
    for (p in allParams) {
      if (allParams[p] == "Delete") {
        //Add delete button
        var td = $('<td/>', {}).appendTo(row);
        var bye = $('<i/>', {
          class: "fa fa-times delete-subject",
          data_id: students[s]['_id']
        }).appendTo(td);

      } else {
        attr = students[s]['info'][allParams[p]]
        $('<td/>', {
          text: attr
        }).appendTo(row);
      }
    }
  }
}

function populateParamDropdown() {
  var envId = Router.current().params._envId
  subjParams = SubjectParameters.find({'children.envId':envId}).fetch()[0];
  parameterPairs = subjParams["children"]["parameterPairs"];

  var modal = $('#param-modal-content');
  
  var name = $("<div/>", {
      class: "columns  boxes-wrapper"
    }).appendTo(modal);

    var label = $("<div/>", {
      class: "column has-text-centered subj-drop-labels title is-5",
      text: "Name"
    }).appendTo(name);

    $('<input/>', {
        class: "column input",
        id: "student-name",
        type: "text",
        placeholder: "Eg, Joey or Male Student"
      }).appendTo(name);


  //
  //DROPDOWN CREATION FOR MODAL
  //
  //go through each parameter pair and create a box
  for (var param = 0; param<parameterPairs; param++) {
    var wrap = $("<div/>", {
      class: "columns "
    }).appendTo(modal);

    var label = $("<h2/>", {
      class: "column has-text-centered subj-drop-labels title is-5",
      text: subjParams['children']['label'+param]
    }).appendTo(wrap);

    var params = subjParams['children']['parameter'+param]
    var options = params.split(',');
    var select = $("<select/>", {
          class: "column has-text-centered select subj-drop-params",
          name: subjParams['children']['label'+param]
        }).appendTo(wrap);
    for (opt in options) {
        var option = $("<option/>", {
          value: options[opt],
          text: options[opt]
        }).appendTo(select);

        option.select(function (e) {
          e.preventDefault();
          $(this).siblings().removeClass('chosen');
          $(this).addClass('chosen');
        });
    }//end for
  }//end for

  $("<button/>", {
    class: "button is-medium is-success",
    id: "save-subj-params",
    text: "Add Subject"
  }).appendTo(modal);
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
          $(this).addClass('chosen');
        });
    }//end for
  }//end for

  $("<button/>", {
    class: "button is-medium is-success",
    id: "save-subj-params",
    text: "Add Subject"
  }).appendTo(modal);

}

