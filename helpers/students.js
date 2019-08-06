import {setupSubjectParameters} from "/helpers/parameters";

function getStudents(envId) {
  let students = Subjects.find({envId:envId}, {reactive: false}).fetch();
  let allParams = setupSubjectParameters(envId);
  return updateStudents(students, allParams);
}

function getStudent(subjId, envId) {
  let student = Subjects.findOne({_id: subjId}, {reactive: false});
  let allParams = setupSubjectParameters(envId);
  return updateStudent(student, allParams);

}

function updateStudents(students, allParams) {
  // console.log('updateStudents', students, allParams);

  // if we have the legacy student params, convert to the new ones.
  students.forEach(function(student) {
    updateStudent(student, allParams)
  });
  return students
}

function updateStudent(student, allParams) {
  if (student.info['demographics'] === undefined || Object.keys(student.info['demographics']).length === 0) {
    student.info.demographics = {};
    for (let param_k in allParams) {
      if (!allParams.hasOwnProperty(param_k)) continue;
      let param = allParams[param_k];
      student.info.demographics[param.name] = student.info[param.name]
    }
  }
  return student
}


export {updateStudent, updateStudents, getStudents, getStudent}