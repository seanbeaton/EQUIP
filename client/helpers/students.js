

function updateStudents(students, allParams) {
  // if we have the legacy student params, convert to the new ones.
  students.forEach(function(student) {
    updateStudent(student, allParams)
  });
  return students
}

function updateStudent(student, allParams) {
  if (student.info['demographics'] === undefined) {
    student.info.demographics = {};
    for (let param_k in allParams) {
      if (!allParams.hasOwnProperty(param_k)) continue;
      let param = allParams[param_k];
      student.info.demographics[param.name] = student.info[param.name]
    }
  }
  return student
}


export {updateStudent, updateStudents}