/*
* JS file for environment_item.html
*/

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
  var env_name = $('.environment-name');
  var env_name_wrapper = $('.environment-name-wrapper');
  var currently_editing = !!(env_name.hasClass('editing'));
  var edit_swap_button = $('#edit-classroom-name');

  if (!currently_editing) {
    env_name_wrapper.prepend($('<input>', {
      class: 'edit-env-name title is-3',
      value: env_name.html()
    }));

    env_name.addClass('editing');
    env_name.hide();

    $('.edit-env-name').on('keyup', function(e) {
      if (e.keyCode === 13) {
        edit_swap_button.click()
      }
    })
  }
  else {
    var new_env_name = $('.edit-env-name');
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
          class: 'name-save-result success-message',
          text: 'Saved'
        });

        env_name.html(new_name);
      }
      else {
        message = $('<span/>', {
          class: 'name-save-result error-message',
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

  currently_editing = !currently_editing;
  edit_swap_button.html((currently_editing) ? 'Save' : 'Edit')
}
