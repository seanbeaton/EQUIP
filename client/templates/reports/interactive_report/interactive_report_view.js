
//Generate classroom buttons immediately
import {getSequence, getSequences} from "../../../helpers/sequences";
import {getStudent, getStudents} from "../../../helpers/students";
import {setupSubjectParameters, setupSequenceParameters} from "../../../helpers/parameters";

var d3 = require('d3');


Template.interactiveReportView.rendered = function() {
    // show different report options
}

Template.interactiveReportView.events({
    'click .option--demographic': function(e) {
        let $target = $(e.target);
        if (!$target.hasClass('selected')) {
            $('.option--demographic').removeClass('selected');
            $target.addClass('selected');
        }
        $(window).trigger('updated-filters')
    },
    'click .option--discourse': function(e) {
        let $target = $(e.target);
        if (!$target.hasClass('selected')) {
            $('.option--discourse').removeClass('selected');
            $target.addClass('selected');
        }
        $(window).trigger('updated-filters')
    },
    'click .swappable__button': function(e) {
        console.log('click');
        let $target = $(e.target);
        $target.parents('.swappable').toggleClass('swapped')
        $(window).trigger('updated-filters');
    },

})

let getCurrentDiscourseSelection = function() {
    let selected = $(".option--discourse.selected");
    if (selected.length !== 0) {
        return selected.attr('data-discourse-id');
    }
    else {
        return false
    }
}

let getCurrentDemographicSelection = function() {
    let selected = $(".option--demographic.selected");
    if (selected.length !== 0) {
        return selected.attr('data-demo-id');
    }
    else {
        return false
    }
};

let getXAxisSelection = function() {
    let $swappable = $('.swappable');
    let param_wrapper;
    if ($swappable.hasClass('swapped')) {
        param_wrapper = $swappable.find('.param-select:last-child');
    }
    else {
        param_wrapper = $swappable.find('.param-select:first-child');
    }
    let selected = $('.report-select__option.selected', param_wrapper);
    console.log('selected x axis', selected);


    let selected_value = selected.attr('data-id');
    let param_type = selected.attr('data-param-type');
    let options = getParamOptions(param_type);
    let selected_option = options.filter(opt => opt.name === selected_value)[0];
    selected_option.option_list = selected_option.options.split(',').map(function(i) {return i.trim()})


    let ret = {
        selected_value: selected_value,
        selected_option: selected_option,
        param_type: param_type,
        options: options,
        // selected_value_options: getParamOptions(self.param_type).filter(opt => opt.name === selected.attr('data-id'))
        // [0].split(',').map(function(i) {return i.trim()})
    }
    console.log('ret in x axis', ret);

    return ret
};

let getYAxisSelection = function() {
    let $swappable = $('.swappable');
    let param_wrapper;
    if ($swappable.hasClass('swapped')) {
        param_wrapper = $swappable.find('.param-select:first-child');
    }
    else {
        param_wrapper = $swappable.find('.param-select:last-child');
    }
    let selected = $('.report-select__option.selected', param_wrapper);
    console.log('selected y axis', selected);
    let y_axis_opts = getParamOptions(selected.attr('data-param-type'));
    console.log('options for y axis', y_axis_opts);

    let selected_value = selected.attr('data-id');
    let param_type = selected.attr('data-param-type');
    let options = getParamOptions(param_type);
    let selected_option = options.filter(opt => opt.name === selected_value)[0];
    selected_option.option_list = selected_option.options.split(',').map(function(i) {return i.trim()})

    let ret = {
        selected_value: selected_value,
        selected_option: selected_option,
        param_type: param_type,
        options: options,
        // selected_value_options: getParamOptions(self.param_type).filter(opt => opt.name === selected.attr('data-id'))
        // [0].split(',').map(function(i) {return i.trim()})
    }
    console.log('ret in y axis', ret);
    return ret
};

let getParamOptions = function(param_type) {
    if (param_type === "discourse") {
        return getDiscourseDimensions()
    }
    else {
        return getDemographics()
    }
};

let allParamsSelected = function () {
    let demo_select = getCurrentDemographicSelection();
    let disc_select = getCurrentDiscourseSelection();
    return (!!demo_select && !!disc_select)
};


$(window).on('updated-filters', function() {
    if (allParamsSelected()) {
        updateReport()
    }
});

let updateReport = function() {
    console.log('updateReport')

    let report_wrapper = $('.report-section--interactive-report')
    report_wrapper.removeClass('inactive');
    if ($('.interactive-report', report_wrapper).length === 0) {
        createReport()
    }
    updateReportTitle()
    updateKeySidebar();
    updateGraph();



    // update the report values
}

let updateGraph = function() {
    let envId = getEnvironment()._id;
    let obsIds = [getObservation()._id];
    let xParams = getXAxisSelection();
    let yParams = getYAxisSelection();

    let graphData = getContributionData(obsIds, xParams, yParams, envId);
    let demData = makeDemGraphs(envId, xParams, envId);
    makeRatioGraphs(envId, graphData, demData);
    console.log('graphData', graphData);

    let contrib_data = compileContributionData(obsIds, xParams, yParams, envId)
};

/**
    contrib_data = {
        y_axis: {

        }
    }
 */
let compileContributionData = function(obsIds, xParams, yParams, envId) {
    let contrib_data = {
        y_axis: {
            Race: {

            },
            Gender: {

            }
        }
    }

}

function makeDemGraphs(envId, dparams) {
    let subs = getStudents(envId);
    var data = {};

    for (p in dparams) {
        data[dparams[p]] = {}
        for (s in subs) {
            console.log('subs[s][\'info\']', subs[s]['info']);
            var val = subs[s]['info']['demographics'][dparams[p]]
            console.log('VAL HEREval=', val)

            if (val && val in data[dparams[p]]) {
                data[dparams[p]][val] += 1;
            } else if (val) {
                data[dparams[p]][val] = 1;
            }
        }
    }

    for (key in data){
        console.log('making dev graphs with data', data)
        // makePieChart(d3.entries(data[key]), key);
    }
    return data;
}

function getContributionData(obsIds, demographicParam, sequenceParam, envId) {
    data = {};
    for (let d in demographicParam) {
        if (!demographicParam.hasOwnProperty(d)) continue;
        data[demographicParam[d]] = {};
    }

    for (let id in obsIds) {
        if (!obsIds.hasOwnProperty(id)) continue;
        let sequences = getSequences(obsIds[id], envId);

        // console.log('obser', seqs);
        for (let sequence in sequences) {
            if (!sequences.hasOwnProperty(sequence)) continue;
            var studId = sequences[sequence]['info']['student']['studentId'];
            let student = getStudent(studId, envId);

            for (let sp_key in sequenceParam) {
                if (!sequenceParam.hasOwnProperty(sp_key)) continue;
                var param = sequenceParam[sp_key];

                var value = sequences[sequence]['info']['parameters'][param];
                if (!value) { continue; }
                for (let d_key in demographicParam) {
                    if (!demographicParam.hasOwnProperty(d_key)) continue;

                    var dem = demographicParam[d_key];
                    var demVal = student['info']['demographics'][dem];
                    // console.log('looking for demVal', demVal);
                    if (!demVal) {continue; }

                    if (!(param in data[demographicParam[d_key]])) { data[dem][param] = {}; }
                    if (!(value in data[dem][param])) { data[dem][param][value] = {}; }


                    if (demVal in data[dem][param][value]) {
                        data[dem][param][value][demVal] += 1;
                    } else {
                        data[dem][param][value][demVal] = 1;
                    }
                    // console.log('data', data);
                }

            }
        }
    }

    for (let demp in data) {
        if (!data.hasOwnProperty(demp)) continue;
        for (param in data[demp]) {
            if (!data[demp].hasOwnProperty(param)) continue;
            var label = ""+param+" by "+demp;
            var dataSlice = d3.entries(data[demp][param]);
            //Commenting out until final decision
            //No need for now!!
            //makeStackedBar(dataSlice, label, ".contribution-plots", "# of Contributions");
        }
    }
    return data;
}


function makeRatioGraphs(envId, cData, dData) {
    console.log('makeRatioGraphs');
    var statData = {};
    var total = d3.sum(d3.values(dData[d3.keys(dData)[0]]))
    // var allParams = SubjectParameters.findOne({"children.envId": envId});
    let allParams = setupSubjectParameters(envId);

    for (key in dData) {
        statData[key] = dData[key];
        d3.keys(statData[key]).map(function (k, i) { statData[key][k] /= total });
    }

    var ratioData = {}

    for (demo in cData) {
        ratioData[demo] = cData[demo];
        for (param in cData[demo]) {
            for (c in cData[demo][param]) {
                var totalCat = d3.sum(d3.values(cData[demo][param][c]));
                d3.keys(ratioData[demo][param][c]).map(function (k, i) { ratioData[demo][param][c][k] /= totalCat });
                d3.keys(ratioData[demo][param][c]).map(function (k, i) { ratioData[demo][param][c][k] /= (statData[demo][k]) });
            }
        }
    }

    console.log('ratioData', ratioData);
    for (let demp in ratioData) {
        console.log('demp', demp);

        for (let param in ratioData[demp]) {
            console.log('param', param);

            var label = param + " by " + demp;
            var dataSlice = d3.entries(data[demp][param]);
            //new
            for (let obj in dataSlice) {
                console.log('allParams', allParams);

                for (let param_k in allParams) {
                    console.log('param_k',  param_k);

                    if (!allParams.hasOwnProperty(param_k)) continue;
                    let param = allParams[param_k];
                    // consol
                    if (param.name !== demp) continue;  // todo: this really needs to be refactored.

                    let listedParams = param.options.split(',').map((str) => { return str.trim() });
                    for (p in listedParams) {
                        if (listedParams[p] in dataSlice[obj].value) {
                            // continue;
                        } else {
                            dataSlice[obj]['value'][listedParams[p]] = 0.0;
                        }
                    }
                }
            }
            console.log('tello');
            var sortedData = [];

            let sequenceParameters = setupSequenceParameters(envId);

            function getParamInfoByName(object, value) {
                return object.find(function(item) {return item.name === value});
            }

            var param_item = getParamInfoByName(sequenceParameters, param);
            // console.log('paramitem', param_item);
            var barParams = param_item.options.split(",").map((str) => { return str.trim() });
            // console.log('barparams', barParams);

            for (var i = 0; i < barParams.length; i++) {
                for (var j = 0; j < dataSlice.length; j++) {
                    if (barParams[i] === dataSlice[j].key) {
                        sortedData.push(dataSlice[j]);
                    }
                }
            }

            console.log('sortedData', sortedData);

            let wrapper_class = "ratio-plot--" + label.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            $(".interactive-report__graph").html('<div class="ratio-plot ' + wrapper_class + '"></div>');
            makeStackedBar(sortedData, label, "." + wrapper_class, "Equity Ratio");
        }
    }
}


function makeStackedBar(dataEnum, label, selector, yLabel) {
    var margin = {top: 50, right: 20, bottom: 30, left: 40},
        width = 550 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        fullW = 550,
        fullH = 500;

    var svg = d3.select(selector)
        .append("svg")
        .attr('width', fullW)
        .attr('height', fullH);

    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // BarChart Axes
    var x0 = d3.scaleBand()
        .rangeRound([0, width - 60])
        .paddingInner(0.1);

    // Grouping Axis
    var x1 = d3.scaleBand()
        .padding(0.5);

    // Bars
    var y = d3.scaleLinear()
        .rangeRound([height, 20]);

    //Colors
    var z = d3.scaleOrdinal()
        .range(["#F17CB0", "#60BD68", "#FAA43A", "#F15854", "#DECF3F", "#B276B2", "#B2912F"]);

    //Set Keys
    sample = dataEnum[0].value;
    keys = [];
    for (bit in sample) {
        keys.push(bit);
    }

    var sortedKeys = keys.sort();

    x0.domain(dataEnum.map(function(d) { return d.key; }));
    x1.domain(sortedKeys).rangeRound([0, x0.bandwidth()]);

    // y.domain([0, 1.25 * d3.max(dataEnum, function(d) { return d3.max(sortedKeys, function(key) { return d.value[key]; }); })]).nice();

    // caps equity ratio to 4  vs having it dynamiclly populated based on value as above.
    y.domain([0,3]);
    g.append("g")
        .selectAll("g")
        .data(dataEnum)
        .enter().append("g")
        .attr("transform", function(d) { return "translate(" + x0(d.key) + ",0)"; })
        .attr('class', "bar-chart")
        .selectAll("rect")
        .data(function(d) { return sortedKeys.map(function(key) { val = d.value[key] || .01; val = val >= 3 ? 3 : val; return {key: key, value: val} }) })
        .enter().append("rect")
        .attr('class', 'rect')
        .attr("x", function(d) { return x1(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return z(d.key); })
        .enter().append("g")
        .attr("font-size", "20px")
        .data(function(d) { return sortedKeys.map(function(key) { val = d.value[key] || 0; return {key: key, value: val} }) })
        .enter().append("text")
        .text(function(d) { if (d.value == 0 || d.value >= 3) return Math.round(d.value) })
        .attr("width", x1.bandwidth())
        .attr("x", function(d) { return x1(d.key) + ((x1.bandwidth() / 2) - 3); })
        .attr("y", function(d) {
            if (d.value >=  3 ) {
                return y(3) - 10;
            } else {
                return y(d.value) - 10;
            }
        })

    g.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", -5)
        .attr("y", y(y.ticks().pop()) - 10)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text(yLabel);

    g.append("line")
        .style("stroke", "black")
        .attr("x1", 0)
        .attr("y1", y(1.0))
        .attr("x2", width)
        .attr("y2", y(1.0));

    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(sortedKeys.slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 25)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 30)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });

    g.append("text")
        .attr("x", fullW / 2)
        .attr("y", -20)
        .attr("dy", "0.32em")
        .attr("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("font-size", 24)
        .text(label);

}

let updateReportTitle = function() {
    let title = `${getYAxisSelection().selected_value} <span class="deemphasize">by</span> ${getXAxisSelection().selected_value}`
    $('.interactive-report__title').html(title)
}

let updateKeySidebar = function() {
    let y_axis = getYAxisSelection();
    console.log('y axis', y_axis);
    let label_colors = getLabelColors(y_axis.selected_option.option_list);
    console.log('label_colors, label_colors', label_colors);
    let key_chunks = Object.keys(label_colors).map(function(label) {
        let color = label_colors[label]
        return `<span class="key--label"><span class="key--color" style="background-color: ${color}"></span>${label}</span>`
    })

    console.log('label colors', label_colors)
    let html = $(`<div class='sitebar-label'>Key: ${y_axis.selected_value}</div>
                    ${key_chunks.join('')}
`)
    $('.interactive-report__key-sidebar').html(html)
}

let available_colors = [
    "#003f5c",
    "#2f4b7c",
    "#665191",
    "#a05195",
    "#d45087",
    "#f95d6a",
    "#ff7c43",
    "#ffa600"
];


function shiftArrayToLeft(arr, places) {
    arr.push.apply(arr, arr.splice(0,places));
}

let getLabelColors = function(labels) {
    let local_colors = available_colors.slice();

    let spacing = Math.max(Math.floor(available_colors.length / labels.length), 1);

    let label_colors = {};
    console.log('local_colors', local_colors);
    let _ = labels.map(function(label) {
        if (typeof label_colors[label] === 'undefined') {
            let new_color = local_colors[0];
            local_colors.push(new_color);
            label_colors[label] = new_color;
            shiftArrayToLeft(local_colors, spacing);
        }
        else {

        }
    });
    return label_colors
}

let createReport = function() {
    console.log('createReport')
    let report_structure = $('<div class="interactive-report">' +
        '<div class="interactive-report__top-left"></div>' +
        '<div class="interactive-report__y-scale"></div>' +
        '<div class="interactive-report__title"></div>' +
        '<div class="interactive-report__graph"></div>' +
        '<div class="interactive-report__key-sidebar"></div>' +
        '</div>')
    $('.report-section--interactive-report').append(report_structure);
}

Template.interactiveReportView.helpers({
    discourseDimensions: function() {
        return getDiscourseDimensions()
    },
    demographics: function() {
        return getDemographics()
    },
    environment: function() {
        return getEnvironment();
    },
    observation: function() {
        return getObservation();
    }
});

let getDemographics = function() {
    let obsId = Router.current().params._obsId;
    let observation = Observations.findOne({_id: obsId});
    let subjParams = setupSubjectParameters(observation.envId);
    console.log('subjParams ', subjParams);
    return subjParams
};

let getDiscourseDimensions = function() {
    let obsId = Router.current().params._obsId;
    let observation = Observations.findOne({_id: obsId});

    let discDims = setupSequenceParameters(observation.envId);
    console.log('discDims ', discDims);
    return discDims
};

let getEnvironment = function() {
    let obsId = Router.current().params._obsId;
    let observation = Observations.findOne({_id: obsId});
    return Environments.findOne({_id: observation.envId})
}

let getObservation = function() {
    let obsId = Router.current().params._obsId;
    return Observations.findOne({_id: obsId});
}