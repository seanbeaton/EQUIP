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
  'click #edit-sequence-params': function(e) {
     e.preventDefault();
     Router.go('editSequenceParameters', {_envId:this._id});
  },
  'click #edit-class-params': function(e) {
     e.preventDefault();
     Router.go('editSubjectParameters', {_envId:this._id});
  },
  'click #edit-class-studs': function(e) {
     e.preventDefault();
     Router.go('editSubjects', {_envId:this._id});
  },
  'click .toggle-accordion': function(e) {
      e.preventDefault();
      var ele = e.target;
      // Bubble up to parent element so accordion toggles correctly
      if (ele.nodeName === "H3" || ele.nodeName === "SPAN") {
          ele = ele.parentElement;
      }

      $(ele).next().toggleClass('show');
      $(ele).next().slideToggle(350);
      $(ele).find(".carat").toggleClass("carat-show");
    }
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
    incrementIndex: function(index) {
        return index + 1;
    },
    getEnvironmentId: function() {
        return this._id;
    },
    getSubjectParameters: function() {
        var subjectParameters =  SubjectParameters.find({'children.envId': this._id}).fetch();

        if (subjectParameters.length === 0) return;

        var parsedSubjectParameters = subjectParameters[0].children;
        var labels = [];
        for (student in parsedSubjectParameters) {
            if (student.includes("label")) {
                labels.push(parsedSubjectParameters[student]);
            }
        }
        return labels.join(", ")
    },
    getDiscourceParameters: function() {
        var sequenceParameters = SequenceParameters.find({'children.envId': this._id}).fetch();

        if (sequenceParameters.length === 0) return;

        var parsedDiscourseParameters = sequenceParameters[0].children;
        var labels = [];

        for (type in parsedDiscourseParameters) {
            if (type.includes("label")) {
                labels.push(parsedDiscourseParameters[type]);
            }
        }
        return labels.join(", ")
    },
    getStudents: function() {
        var user = Meteor.user();
        var students = Subjects.find({userId: user._id}).fetch();

        let filteredStudents = students.filter(student => student.envId === this._id)
            .map(student => student.info.name)

        return {
            names: filteredStudents.join(", "),
            count: filteredStudents.length
        }
    },
    getStudentCount: function() {
        var user = Meteor.user();

        return Subjects.find({userId: user._id}).count();
    },
    getObservations: function() {
        return Observations.find({envId:this._id}, {sort: {datefield: 1}}).fetch();
    },
    getObservationsCount: function() {
        return Observations.find({envId:this._id}, {sort: {lastModified: -1}}).count();
    },
    hasObsMade: function() {
        var obs = Observations.find({envId:this._id}, {sort: {lastModified: -1}}).fetch();
        if (obs.length === 0) {
            return true
        }
    },
    getEnvName: function() {
        return this.envName;
    }
});
