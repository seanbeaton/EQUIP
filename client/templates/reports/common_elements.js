Template.absentStudents.helpers({
  getAbsentStudents: function(obsId) {
    let absent_students = Subjects.find({_id: {$in: Observations.findOne({_id: obsId}).absent}}).map(s => s.info.name);
    if (absent_students.length !== 0) {
      return absent_students.join(', ');
    }
    else {
      return "- None -"
    }
  },
  anyAbsentStudents: function(observations) {
    console.log('obs here', observations, !observations.every(o => o.absent.length === 0));
    return !observations.every(o => o.absent.length === 0)
  }
})