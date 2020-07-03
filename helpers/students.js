import {setupSubjectParameters} from "/helpers/parameters";
import {console_log_conditional} from "./logging"

function getStudents(envId, reactive) {
  if (typeof reactive === 'undefined') {
    reactive = false;
  }
  let students = Subjects.find({envId:envId}, {reactive: reactive}).fetch();
  let allParams = SubjectParameters.findOne({envId: envId}).parameters;
  return updateStudents(students, allParams);
}

function getStudent(subjId, envId, reactive) {
  if (typeof reactive === 'undefined') {
    reactive = false;
  }
  let student = Subjects.findOne({_id: subjId}, {reactive: reactive});
  let allParams = SubjectParameters.findOne({envId: envId}).parameters;
  return updateStudent(student, allParams);

}

function updateStudents(students, allParams) {
  // console_log_conditional('updateStudents', students, allParams);

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
      student.info.demographics[param.label] = student.info[param.label]
    }
  }
  return student
}


export {updateStudent, updateStudents, getStudents, getStudent}