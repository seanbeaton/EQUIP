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
    console.log('adding a new row');
    addNewRow(subj_params);
  }
};

Template.editSubjectsAdvanced.events({
  'click .remove-student': function(e) {
    let target = $(e.target);
    let row = target.parents('tr')
    if (row.attr('data-row-status') === 'new') {
      let new_rows = partial_rows.get();
      let row_to_remove = new_rows.findIndex(r => r.id === row.attr('data-student-id'))
      console.log('new row id', row_to_remove);
      new_rows.splice(row_to_remove, 1);
      partial_rows.set(new_rows);
      // handle new row numbering once some have been deleted
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
    row.attr('data-deleted', '');
  },
  'focusout input[data-student-type="new"]': function(e, template) {
    console.log('testing e', e, template);

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
      console.log(e);
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
    console.log('paste e', e);
    console.log(e.originalEvent.clipboardData.getData('text'));
    let data = e.originalEvent.clipboardData.getData('text');
    if (!data.match(/\t.*\n/g)) {
      console.log('no tabular data found on paste');
      return;
    }
    let rows = data.split(/\n/g);
    console.log('rows', rows);

    let params = setupSubjectParameters(template.data.environment._id);
    let param_names = params.map(param => param.name);
    param_names.push('name');
    let headers = {};

    if (rows[0].split(/\t/g).some(header => !!param_names.find(name => name.toLowerCase() === header.toLowerCase()))) {
      if (!rows[0].split(/\t/g).every(header => !!param_names.find(name => name.toLowerCase() === header.toLowerCase()))) {
        alert("Some of the data you pasted was able to match to existing columns, but not all. The following headers did not match: " +
          rows[0].split(/\t/g).filter(col => !param_names.find(name => name.toLowerCase() === col.toLowerCase())).join(', ')
        + '.\n The data in those columns were not imported.')
      }
      let header_row_items = rows[0].split(/\t/g)
      header_row_items.forEach(function(header_item, index) {
        if (!!param_names.find(name => name.toLowerCase() === header_item.toLowerCase())) {
          console.log('found ', header_item, 'at index', index)
          headers[index] = header_item;
        }
        else {
          console.log("fdidn't find", header_item);
        }
      })
    }
    else {
      console.log('none match')
    }

    let structured_data = rows.map(function(row) {
      console.log('row', row);
      return row.split(/\t/g);
    })

    if (Object.keys(headers).length > 0) {
      structured_data = structured_data.slice(1, structured_data.length);
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
        alert('pasting tabular data without headers not supported');
      }
    })

    e.preventDefault();
    if (target.attr('data-student-type') === 'new') {
      target.parents('tr').find('.remove-student').click();
    }


  }
});

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
let checkTableValues = function(cell, parameters) {

}