import {console_log_conditional} from "/helpers/logging"
import {checkAccess} from "../../helpers/access";


Meteor.methods({
  getInteractiveReportData: function (parameters, refresh) {
    checkAccess(parameters.envId, 'environment', 'view');
    console_log_conditional(parameters, refresh)
    if (typeof refresh === 'undefined') {
      refresh = false;
    }
    let user = Meteor.user();

    const parameters_cache_key = JSON.stringify(parameters);
    const one_hour = 1 * 60 * 60 * 1000;
    const search_time_limit = refresh ? 0 : one_hour;

    let fetch_start = new Date().getTime();
    let report_data = CachedReportData.findOne({
      createdAt: {$gte: new Date(new Date().getTime() - search_time_limit)},
      reportType: 'getInteractiveReportData',
      parameters_cache_key: parameters_cache_key,
    }, {
      sort: {createdAt: -1}
    });

    if (!report_data) {
      let start = new Date().getTime();
      report_data = {
        data: compileContributionData(parameters),
        createdAt: new Date(),
        reportType: 'getInteractiveReportData',
        parameters_cache_key: parameters_cache_key,
        cached: false
      };
      report_data['timeToGenerate'] = new Date().getTime() - start;
      CachedReportData.insert(Object.assign({}, report_data, {cached: true}))
    }
    else {
      report_data['timeToFetch'] = new Date().getTime() - fetch_start;
    }
    console_log_conditional('getInteractiveReportData data', report_data);
    return report_data
  },
})


let compileContributionData = function (parameters) {
  let {obsIds, xParams, yParams, envId, currentDemo} = parameters

  let contrib_data = {
    y_axis: [],
    y_axis_selected: yParams.selected_value,
    x_axis_selected: xParams.selected_value,
    y_axis_param_type: yParams.param_type,
    x_axis_param_type: xParams.param_type,
  };

  if (yParams.param_type === 'demographics') {
    contrib_data.selected_demographic = yParams.selected_value;
    contrib_data.selected_discourse_dimension = xParams.selected_value;
  }
  else {
    contrib_data.selected_demographic = xParams.selected_value;
    contrib_data.selected_discourse_dimension = yParams.selected_value;
  }

  // Add each coulumn of X

  let defaultXAxisObj = {};
  let studentContributionsXAxisObj = {};

  // Init each "group" with 0 across all values.
  for (let y_axis_item_key in yParams.selected_option.option_list) {
    if (!yParams.selected_option.option_list.hasOwnProperty(y_axis_item_key)) {
      continue;
    }
    let y_axis_item = yParams.selected_option.option_list[y_axis_item_key];
    defaultXAxisObj[y_axis_item] = 0;
    studentContributionsXAxisObj[y_axis_item] = {};
  }

  // Create each group with the correct title
  for (let x_axis_item_key in xParams.selected_option.option_list) {
    if (!xParams.selected_option.option_list.hasOwnProperty(x_axis_item_key)) {
      continue;
    }
    let x_axis_item = xParams.selected_option.option_list[x_axis_item_key];
    let x_axis_obj = JSON.parse(JSON.stringify(defaultXAxisObj)); // Clone the obj
    x_axis_obj["column_name"] = x_axis_item;
    x_axis_obj["student_contributions"] = JSON.parse(JSON.stringify(studentContributionsXAxisObj));
    // add item after extending the default x axis obj
    contrib_data.y_axis.push(x_axis_obj)
  }

  // Create by-student data structure
  let students = Subjects.find({envId: envId}).fetch()

  contrib_data.students = students.map(function (student) {
    student.contributions = [];
    return student;
  });

  // Record contributions
  // console.log('obsIds', obsIds);

  obsIds.forEach(function (obsId) {
    Sequences.find({obsId: obsId}).forEach(function (sequence) {
      let sequence_y;

      if (yParams.selected_value === "Total Contributions" || yParams.selected_value === "All Students") {
        sequence_y = yParams.selected_value
      }
      else if (yParams.param_type === 'demographics') {
        sequence_y = sequence.info.student.demographics[yParams.selected_value];
      }
      else {
        sequence_y = sequence.info.parameters[yParams.selected_value];
      }

      let sequence_x;

      if (xParams.selected_value === "Total Contributions" || xParams.selected_value === "All Students") {
        sequence_x = xParams.selected_value
      }
      else if (xParams.param_type === 'demographics') {
        sequence_x = sequence.info.student.demographics[xParams.selected_value];
      }
      else {
        sequence_x = sequence.info.parameters[xParams.selected_value];
      }

      // console.log('seq x and y', sequence_x, sequence_y)
      // console.log('stud', sequence.info.parameters)

      let student_index = contrib_data.students.findIndex(function (student) {
        return student._id === sequence.info.student.studentId
      });
      contrib_data.students[student_index].contributions.push(sequence.info.parameters);

      increaseValueForAxes(contrib_data.y_axis, sequence_y, sequence_x);
      increaseValueForStudent(contrib_data.y_axis, sequence_y, sequence_x, sequence.info.student);

    })
  })

  // Set up columns
  contrib_data.column_keys = yParams.selected_option.option_list;

  // Get n values for groups
  contrib_data.x_axis_n_values = {};

  contrib_data.y_axis.forEach(function (y_item) {
    // get values of the column group
    let values = Object.keys(y_item).map(function (key) {
      if (key !== 'column_name') {
        return y_item[key]
      }
    }).filter(item => !isNaN(item));
    // total above values
    let column_n_values = Object.assign({}, y_item);
    delete column_n_values['column_name'];
    delete column_n_values['student_contributions'];

    contrib_data.x_axis_n_values[y_item.column_name] = {
      n: values.reduce((a, b) => a + b, 0),
      columns: column_n_values
    }
  });

  // Get n values for totaled graphs (y)

  contrib_data.y_axis_n_values = {};

  contrib_data.y_axis.forEach(function (y_item) {
    let y_axis_items = Object.assign({}, y_item);
    delete y_axis_items['column_name'];
    delete y_axis_items['student_contributions'];
    Object.keys(y_axis_items).forEach(function (key) {
      if (typeof contrib_data.y_axis_n_values[key] !== 'undefined') {
        contrib_data.y_axis_n_values[key] += y_axis_items[key]
      }
      else {
        contrib_data.y_axis_n_values[key] = y_axis_items[key]
      }
    })

  });

  // Calculate equity ratios. These are done by taking
  // (num_contributions_by_value/total_contributions) / (num_subjects_with_value/total_subjects)

  // num_students_by_y_value

  // to make equity ratios not count students that were missing for
  // a class or two (and were marked as such, once that's possible),
  // we'll need to update how this is calculated, perhaps by doing it
  // by observation, then calculating the equity ratio per observation.
  // all equity ratios across all observations would then need to be averaged.

  // Students were already created earlier.
  let demographics = SubjectParameters.findOne({envId: envId}).parameters;
  let currentDemoOptions;
  if (currentDemo === 'All Students') {
    currentDemoOptions = "All Students"
    contrib_data.student_body_demographic_counts = {
      "All Students": students.length,
    }
    contrib_data.student_body_demographic_ratios = {
      "All Students": 1,
    }
  }
  else {
    currentDemoOptions = demographics.filter(demo => demo.label === currentDemo)[0].options
    contrib_data.student_body_demographic_ratios = {}
    contrib_data.student_body_demographic_counts = {}

    currentDemoOptions.forEach(function (demo) {
      contrib_data.student_body_demographic_ratios[demo] =
        students.filter(student => student.info.demographics[currentDemo] === demo).length / students.length
      contrib_data.student_body_demographic_counts[demo] =
        students.filter(student => student.info.demographics[currentDemo] === demo).length
    });

  }


  // contribData.students.filter(student => student.info.demographics[contribData.selected_demographic] === chosen_demo)
  contrib_data.avg_contributions_data = contrib_data.y_axis.map(function (y) {

    let column_values = Object.assign({}, y);
    delete column_values['column_name'];
    delete column_values['student_contributions'];
    let avg_count_contribs = {}
    Object.keys(column_values).forEach(function (key) {
      // //console_log_conditional('contrib_data', contrib_data, 'key', key);

      let demo_key = (yParams.param_type === 'demographics') ? key : y.column_name;
      // let param_key = (yParams.param_type === 'discourse') ? key: y.column_name;

      let count_in_demo = contrib_data.student_body_demographic_counts[demo_key];
      if (isNaN(count_in_demo)) {
        count_in_demo = 1;
      }

      let count_contribs_by_demo = column_values[key];
      if (isNaN(count_contribs_by_demo)) {
        count_contribs_by_demo = 0;
      }

      avg_count_contribs[key] = count_contribs_by_demo / count_in_demo
    });
    avg_count_contribs['column_name'] = y['column_name'];
    return avg_count_contribs;
  });

  contrib_data.equity_ratio_data = contrib_data.y_axis.map(function (y) {

    let column_values = Object.assign({}, y);
    delete column_values['column_name'];
    delete column_values['student_contributions'];
    let equity_ratios = {}
    Object.keys(column_values).forEach(function (key) {
      // //console_log_conditional('contrib_data', contrib_data, 'key', key);

      let demo_key = (yParams.param_type === 'demographics') ? key : y.column_name;
      // let param_key = (yParams.param_type === 'discourse') ? key: y.column_name;

      let percent_of_demo = contrib_data.student_body_demographic_ratios[demo_key];
      if (isNaN(percent_of_demo)) {
        percent_of_demo = 0;
      }

      let contrib_axis_n_value = (yParams.param_type === 'demographics') ? contrib_data.x_axis_n_values[y.column_name].n : contrib_data.y_axis_n_values[key];

      //console_log_conditional('column_values ', column_values);
      let percent_of_contribs = (column_values[key] / contrib_axis_n_value);
      if (isNaN(percent_of_contribs)) {
        percent_of_contribs = 0;
      }

      //console_log_conditional('percent of contribs', percent_of_contribs);
      //console_log_conditional('percent_of_demo', percent_of_demo);
      equity_ratios[key] = percent_of_contribs / percent_of_demo
    });
    equity_ratios['column_name'] = y['column_name'];
    // equity_ratios['student_contributions'] = y['student_contributions'];
    return equity_ratios;
  });

  // and we're done

  //console_log_conditional('contrib_data', contrib_data);

  return contrib_data;
}

let increaseValueForAxes = function (data, y, x) {
  // x matches to data[n].column_name
  // y matches to a key in data[n]
  // search for the key that matches x, then increment the value of key y.

  for (let x_row_k in data) {
    if (!data.hasOwnProperty(x_row_k)) {
      continue;
    }
    let x_row = data[x_row_k];
    if (x_row.column_name !== x) {
      continue;
    }
    x_row[y]++
  }
}

let increaseValueForStudent = function (data, y, x, student) {
  // similar to increaseValueForAxes. used to count contribs by students inside a certain x y combo

  for (let x_row_k in data) {
    if (!data.hasOwnProperty(x_row_k)) {
      continue;
    }
    let x_row = data[x_row_k];
    if (x_row.column_name !== x) {
      continue;
    }

    if (typeof x_row['student_contributions'][y][student.studentId] === 'undefined') {
      x_row['student_contributions'][y][student.studentId] = {
        student: student,
        contributionsOfType: 1
      }
    }
    else {
      x_row['student_contributions'][y][student.studentId].contributionsOfType++
    }
  }
}
