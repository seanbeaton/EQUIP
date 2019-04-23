import {setupSubjectParameters} from "../../helpers/parameters";
import {getStudents} from "../../helpers/students";

const partial_rows = new ReactiveVar([]);

Template.editSubjectsAdvanced.helpers({
  envId: function() {
    return this.environment._id;
  },
  subjects: function() {
    return Subjects.find({envId: this.environment._id})
  },
  subject_parameters: function() {
    let subj_params = setupSubjectParameters(this.environment._id);
    return subj_params
  },
  className: function(text) {
    return getClassName(text);
  },
  student_rows: function() {
    let students = getStudents(this.environment._id);
    let subj_params = setupSubjectParameters(this.environment._id);

    let student_rows = [];

    students.forEach(function(student) {
      let columns = [];
      columns.push({
        id: 'student--name--' + student._id,
        data_student_id: student._id,
        data_field_type: 'base',
        data_field: 'name',
        data_student_type: 'existing',
        value: student.info.name,
      });
      subj_params.forEach(function(param) {
        columns.push({
          id: 'student--' + getClassName(param.name) + '--' + student._id,
          data_student_id: student._id,
          data_field_type: 'param',
          data_field: param.name,
          data_student_type: 'existing',
          value: student.info.demographics[param.name],
        })
      })

      student_rows.push({
        id: student._id,
        status: 'existing',
        columns: columns,
      })
    })

    examinePartialRows(this.environment._id);

    let local_partial_rows = partial_rows.get();
    local_partial_rows.forEach(row => student_rows.push(row));

    return student_rows;
  }
});

let examinePartialRows = function(envId) {
  let rows = partial_rows.get();
  let subj_params = setupSubjectParameters(envId);

  if (rows.length === 0 ||
    !(rows[rows.length - 1].columns.map(field => field.value).every(value => !value || value.length === 0))) {
    addNewRow(subj_params);
  }
};

Template.editSubjectsAdvanced.events({
  'click .remove-student': function(e, template) {
    let target = $(e.target);
    let row = target.parents('tr')
    if (row.attr('data-row-status') === 'new') {
      let new_rows = partial_rows.get();
      let row_to_remove = new_rows.findIndex(r => r.id === row.attr('data-student-id'))
      new_rows.splice(row_to_remove, 1);
      partial_rows.set(new_rows);
      setTimeout(function() {
        checkTableValues(setupSubjectParameters(template.data.environment._id))
      }, 500)
    }
    else {
      target.removeClass('remove-student').addClass('undo-remove-student');
      target.attr('data-original-text', target.text());
      target.text('+');
      row.addClass('deleted-student');
      row.attr('data-deleted', 'true');
    }

  },
  'click .undo-remove-student': function(e) {
    let target = $(e.target);
    target.removeClass('undo-remove-student').addClass('remove-student')
    target.text(target.attr('data-original-text'));
    let row = target.parents('tr');
    row.removeClass('deleted-student');
    row.removeAttr('data-deleted');
  },
  'focusout input[data-student-type="new"]': function(e, template) {
    let target = $(e.target);
    let rows = partial_rows.get();
    let row = rows.find(row => row.id === target.attr('data-student-id'));
    let column = row.columns.find(column => column.id === target.attr('id'));
    column.value = target.val();
    partial_rows.set(rows);
  },
  'focusout .student-data-input': function(e, template) {
    let target = $(e.target);
    if (checkCellValue(target, setupSubjectParameters(template.data.environment._id))) {
      target.removeClass('invalid-param-value')
    }
    else {
      target.addClass('invalid-param-value')
    }
  },
  'keyup .student-data-input': function(e, template) {
    if (e.keyCode === 13) {
      let target = $(e.target);
      let new_target;
      if (e.shiftKey) {
        new_target = target.parents('tr').prev().find('input[data-field="' + target.attr('data-field') + '"][data-field-type="' + target.attr('data-field-type') + '"]')
      }
      else {
        new_target = target.parents('tr').next().find('input[data-field="' + target.attr('data-field') + '"][data-field-type="' + target.attr('data-field-type') + '"]')
      }
      new_target.focus();
    }
  },
  'click .delete-all-students': function(e, template) {
    $('.remove-student').click();
  },
  'click .undelete-all-students': function(e, template) {
    $('.undo-remove-student').click();
  },
  'paste .student-data-input': function(e, template) {
    let target = $(e.target);
    let data = e.originalEvent.clipboardData.getData('text');
    if (!data.match(/\t.*\n/g)) {
      console.log('no tabular data found on paste');
      return;
    }
    let rows = data.split(/\n/g);
    let params = setupSubjectParameters(template.data.environment._id);
    let param_names = params.map(param => param.name);
    param_names.push('name');
    let headers = {};

    if (rows[0].split(/\t/g).some(header => !!param_names.find(name => name.toLowerCase() === header.toLowerCase()))) {
      if (!rows[0].split(/\t/g).every(header => !!param_names.find(name => name.toLowerCase() === header.toLowerCase()))) {
        alert("Some of the data you pasted was able to match to existing columns, but not all. The following headers did not match: " +
          rows[0].split(/\t/g).filter(col => !param_names.find(name => name.toLowerCase() === col.toLowerCase())).join(', ')
        + '.\nThe data in those columns were not imported.')
      }
      let header_row_items = rows[0].split(/\t/g)
      header_row_items.forEach(function(header_item, index) {
        if (!!param_names.find(name => name.toLowerCase() === header_item.toLowerCase())) {
          headers[index] = header_item;
        }
        else {
          console.log("didn't find any headers in item", header_item);
        }
      })
    }
    else {
      console.log('No headers found.')
    }

    let structured_data = rows.map(function(row) {
      console.log('row', row);
      return row.split(/\t/g);
    })

    if (Object.keys(headers).length > 0) {
      structured_data = structured_data.slice(1, structured_data.length);
    }

    if (Object.keys(headers).length === 0) {
      alert('Pasting tabular data without headers not supported');
      return;
    }

    structured_data.forEach(function(row) {
      if (Object.keys(headers).length > 0) {
        let new_row_data = {};
        Object.keys(headers).forEach(function(index) {
          new_row_data[headers[index]] = row[index]
        })
        console.log('new row data', new_row_data);
        addNewRow(params, new_row_data);
      }
      else {
        // later, we can add support for just pasting tabular data.
      }
    });

    e.preventDefault();
    if (target.attr('data-student-type') === 'new') {
      target.parents('tr').find('.remove-student').click();
    }
    setTimeout(function() {
      if (!checkTableValues(params)) {
        alert('Errors found in pasted data. Please review your input for any highlighted issues.');
      }
    }, 500)
  },
  'click .save-all-students': function(e, template) {
    let params = setupSubjectParameters(template.data.environment._id);
    if (!checkTableValues(params)) {
      alert('Errors found, not saving. Please review your input for any highlighted issues.');
      return;
    }
    saveStudentsTable(template.data.environment._id, params)
  },
  'click .check-all-students': function(e, template) {
    let params = setupSubjectParameters(template.data.environment._id);
    checkTableValues(params);
    if (!checkTableValues(params)) {
      alert('Errors found. Please review your input for any highlighted issues.');
    }
    else {
      alert('All good!')
    }
  }
});


let saveStudentsTable = function(envId, params) {

  let students_info = []
  $('tr.student-row').each(function(idx) {
    let $row = $(this);
    console.log('row', $row);

    // Don't save completely empty rows.
    let row_empty = true;
    $row.find('input').each(function(){
      if ($(this).val()) {
        row_empty = false;
      }
    })
    if (row_empty) {
      return;
    }

    // create demos obj.
    let demos = {};
    params.forEach(function(param) {
      demos[param.name] = $row.find('input[data-field="' + param.name + '"][data-field-type="param"]').val();
    })


    students_info.push({
      id: $row.attr('data-student-id'),
      status: $row.attr('data-row-status'),
      deleted: !!$row.attr('data-deleted'),
      data_x: '0',
      envId: envId,
      data_y: '0',
      info: {
        name: $row.find('input[data-field="name"][data-field-type="base"]').val(),
        demographics: demos
      }
    })
  })

  console.log('saving student info:', students_info);

  students_info.forEach(function(student) {
    if (student.deleted) {
      Meteor.call('subjectDelete', student.id);
    }
    else if (student.status === 'existing') {
      let update_student = {
        id: student.id,
        info: student.info
      };
      Meteor.call('subjectUpdate', update_student);
    }
    else if (student.status === 'new') {
      let new_student = {
        envId: student.envId,
        data_x: student.data_x,
        data_y: student.data_y,
        info: student.info
      };
      Meteor.call('subjectInsert', new_student);
    }
  });

  // todo: force rerender some other way.
  setTimeout(function() {document.location.reload()}, 2000);
}

let addNewRow = function(params, values) {
  if (typeof values === 'undefined') {
    values = {};
  }
  let rows = partial_rows.get();
  let new_row_id = 0;

  rows.forEach(function (row) {
    if (row.new_row_number >= new_row_id) {
      new_row_id = row.new_row_number + 1;
    }
  });

  let new_row_columns = [{
    id: 'student--name--new-row-' + new_row_id,
    data_student_id: 'new-row--' + new_row_id,
    data_field_type: 'base',
    data_field: 'name',
    data_student_type: 'new',
    value: (typeof values['name'] !== 'undefined') ? values.name : ((typeof values['Name'] !== 'undefined') ? values.Name : ''),
  }]
  params.forEach(function(param) {
    new_row_columns.push({
      id: 'student--' + getClassName(param.name) + '--new-row-' + new_row_id,
      data_student_id: 'new-row--' + new_row_id,
      data_field_type: 'param',
      data_field: param.name,
      data_student_type: 'new',
      value: (typeof values[param.name] !== 'undefined') ? values[param.name] : '',
    });
  });

  rows.push({
    new_row_number: new_row_id,
    id: 'new-row--' + new_row_id,
    status: 'new',
    columns: new_row_columns,
  });
  partial_rows.set(rows);
}


let getClassName = function(text) {
  return text.toLowerCase().replace(' ', '-')
}

let checkCellValue = function(cell, parameters) {
  if (cell.attr('data-field-type') === 'base' && cell.attr('data-field') === 'name') {
    return true;
  }
  let options = parameters.find(param => param.name === cell.attr('data-field')).options.split(',').map(function(item) { return item.trim() });
  return !!options.find(opt => opt === cell.val())
};


// run this on each paste
// also check for duplicate names? do we allow dupe names right now?
// todo: also need to do validation of this input on the server side when we save.
let checkTableValues = function(parameters) {
  let table_passes = true;
  $('tr.student-row').each(function(idx) {
    let $row = $(this);
    // Don't check completely empty rows, they won't be saved anyway.
    let row_empty = true;
    $row.find('input').each(function(){
      if ($(this).val()) {
        row_empty = false;
      }
    });
    if (row_empty) {
      $row.find('input').removeClass('invalid-param-value');
      return;
    }
    $row.find('input').each(function() {
      let $input = $(this);
      if (checkCellValue($input, parameters)) {
        $input.removeClass('invalid-param-value')
      }
      else {
        if (!$row.attr('data-deleted')) {
          table_passes = false;
        }
        $input.addClass('invalid-param-value')
      }
    })
  });
  return table_passes;
}
//
//
// students_list.map(function(student) {
//   let demos = {};
//   Object.keys(student.info).forEach(function(param) {
//     if (param === 'name') {
//       return;
//     }
//     demos[param] = student.info[param];
//   })
//   student.info = {
//     name: student.info.name,
//     demographics: demos
//   }
//   return student;
// })