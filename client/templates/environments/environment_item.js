/*
* JS file for environment_item.html
*/

import { createModal } from '/client/helpers/modals.js'


Template.environmentItem.events({
  'click #enter-class': function(e) {
     e.preventDefault();
     Router.go('observationList', {_envId:this._id});
  },
  'click .export-tab': function (e) {
    e.preventDefault();
    var envId = this._id;
    var name = this.envName
    Meteor.call('exportAllParams', envId, function(error, result){
      if (error){
        alert(error.reason);
      } else {
        // Prompt save file dialogue
        if ($.isEmptyObject(result)) {
          alert("There are no parameters to export. Add parameters to this environment to be able to export.");
          return;
        }
        var json = JSON.stringify(result);
        var blob = new Blob([json], {type: "application/json"});
        var url  = window.URL.createObjectURL(blob);

        var a = document.createElement("a");
        a.href = url;
        a.download = '' + name + '_environment.json';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  },
  'click .import-tab': function (e) {
    var envId = this._id;
    var element = document.createElement('div');
    element.innerHTML = '<input type="file">';
    var fileInput = element.firstChild;

    fileInput.addEventListener('change', function() {
        var file = fileInput.files[0];
        var jsonImport = {};

        if (file.name.match(/\.(json)$/)) {
            var reader = new FileReader();

            reader.onload = function() {
                var contents = reader.result;
                jsonImport = JSON.parse(contents);
                if ('subject' in jsonImport) {
                  jsonImport['subject']['envId'] = envId;

                  Meteor.call('importSubjParameters', jsonImport['subject'], function(error, result) {
                    return 0;
                  });
                } else {
                  alert("Incorrectly formatted JSON import. No Subject parameters.");
                }

                if ('sequence' in jsonImport) {
                  jsonImport['sequence']['envId'] = envId;
                  Meteor.call('importSeqParameters', jsonImport['sequence'], function(error, result) {
                      return 0;
                    });
                } else {
                  alert("Incorrectly formatted JSON import. No Sequence parameters.");
                }


            };
            reader.readAsText(file);
        } else {
            alert("File not supported, .json files only");
        }
    });
    alert("If you select a valid file to import for this classrom, it will overwrite any parameters already set.")
    fileInput.click(); // opening dialog

  },

  'click #edit-class-params': function(e) {
     e.preventDefault();
     Router.go('editSubjectParameters', {_envId:this._id});
  },
  'click #edit-class-studs': function(e) {
     e.preventDefault();
     Router.go('editSubjects', {_envId:this._id});
  },
  'click #edit-classroom-name': function(e) {
    e.preventDefault();
    editClassroomName(this._id);
  },
  'click #env-duplicate': function(e) {
    e.preventDefault();
    duplicateClassroom(this);
  },

  });

Template.environmentItem.events({
   'click #env-delete': function(e) {
     var result = confirm("Deleting an environment will also delete all observation, subject, and sequence data. Press 'OK' to continue.");
     var envId = this._id
    if (result) {
      Meteor.call('environmentDelete', envId, function(error, result) {
        return 0;
      });
    }
  }
 });

 Template.environmentItem.helpers({
  //shim function until database is clean
  trackModified: function () {
    if (this.lastModified) {
      return true;
    } else {
      return false;
    }
  },
   needsSubjects: function() {
     var obj1 = SubjectParameters.find({'children.envId': this._id}).fetch();
     var obj2 = SequenceParameters.find({'children.envId': this._id}).fetch();
     return ($.isEmptyObject(obj1) || $.isEmptyObject(obj2)) ?"pulser":"";
   },
   hasObsMade: function() {
       var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
       if (obs.length === 0) {
           return true
       }
   }
 });


function editClassroomName(envId) {
  let context = $('.environment[data-env-id="' + envId + '"]');

  var env_name = $('.environment-name', context);
  var env_name_wrapper = $('.environment-name-wrapper', context);
  var currently_editing = !!(env_name.hasClass('editing'));
  var edit_swap_button = $('#edit-classroom-name', context);

  if (!currently_editing) {
    env_name_wrapper.prepend($('<input>', {
      class: 'edit-env-name title is-3',
      value: env_name.html()
    }));

    env_name.addClass('editing');
    env_name.hide();

    $('.edit-env-name', context).on('keyup', function(e) {
      if (e.keyCode === 13) {
        edit_swap_button.click()
      }
    })
  }
  else {
    var new_env_name = $('.edit-env-name', context);
    var new_name = new_env_name.val();

    // set new name here.

    var args = {
      'envId': envId,
      'envName': new_name,
    };

    Meteor.call('environmentRename', args, function(error, result) {
      var message;
      if (result) {
        message = $('<span/>', {
          class: 'name-save-result tag is-success inline-block success-message',
          text: 'Saved'
        });

        env_name.html(new_name);
      }
      else {
        message = $('<span/>', {
          class: 'name-save-result tag is-warning inline-block error-message',
          text: 'Failed to save. Try again later'
        })
      }
      env_name_wrapper.append(message);

      setTimeout(function() {
        message.remove();
      }, 3000);

      return 0;
    });

    new_env_name.remove();
    env_name.removeClass('editing');
    env_name.show();
  }

  edit_swap_button.removeClass('is-loading');
  currently_editing = !currently_editing;
  edit_swap_button.html((currently_editing) ? 'Save' : 'Edit')
}

function duplicateClassroom(orig_env) {
  let context = $('.environment[data-env-id="' + orig_env._id + '"]');

  let modal = createModal('Duplicate Classroom', '', 'duplicate-classroom-modal', true);

  let modal_content = modal.find('.modal-card-body');

  let form_el = $('<div/>', {class: 'field'});
  form_el.append($('<label/>', {
    class: "label",
    text: "New Classroom Name",
    for: 'new-env-name',
  }));
  form_el.append($('<input/>', {
    id: "new-env-name",
    class: 'input',
    value: 'Duplicate of ' + orig_env.envName,
  }));

  modal_content.append(form_el);

  modal_content.append($('<p/>', {
    text: "Please select what you'd like to copy from your previous classroom. Note: if you import students you must also import the parameters used to create them.",
    class: 'is-vertical-spaced'
  }));


  form_el = $('<label/>', {
    class: "form-label checkbox spaced-checkbox",
    text: " Parameters",
    for: 'copy-parameters',
  }).prepend($('<input/>', {
    id: "copy-parameters",
    type: 'checkbox',
    checked: true
  }));
  modal_content.append(form_el);

  form_el = $('<label>/', {
    class: "form-label checkbox spaced-checkbox",
    text: " Students",
    for: 'copy-students',
  }).prepend($('<input/>', {
    id: "copy-students",
    type: 'checkbox',
    checked: true
  }));

  modal_content.append(form_el);

  const students_checkbox = modal_content.find('#copy-students');
  const parameters_checkbox = modal_content.find('#copy-parameters');

  parameters_checkbox.on('change', function() {
    const value = $(this).is(":checked");
    students_checkbox.attr('disabled', !value);
    if (!value) {
      students_checkbox.attr('checked', false);
    }
  });

  const modal_footer = modal.find('.modal-card-foot');

  modal_footer.prepend($('<a/>', {
    class: 'button is-primary',
    id: 'submit-duplicate-form',
    text: 'Duplicate Classroom'
  }));

  $('#submit-duplicate-form').on('click', function(e) {
    const import_students = students_checkbox.is(':checked');
    const import_parameters = parameters_checkbox.is(':checked');
    const new_env_name = $('#new-env-name').val();
    if (import_students && !import_parameters) {
      showDuplicationWarning('You cannot import students without importing parameters.')
    }
    const import_values = {
      sourceEnvId: orig_env._id,
      import_students: import_students,
      import_parameters: import_parameters,
      envName: new_env_name,
    }
    Meteor.call('environmentDuplicate', import_values, function(error, result) {
      if (error && error.error === 'duplicate_error') {
        showDuplicationWarning(error.reason)
      }
    });
    modal.remove();

  });

  function showDuplicationWarning(message) {
    $('.obs-dash-list').append('<div class="duplication-warning notification is-warning">' + message + '</div>');
    setTimeout(function() {
      $('.duplication-warning').remove()
    }, 5000);
  }
}