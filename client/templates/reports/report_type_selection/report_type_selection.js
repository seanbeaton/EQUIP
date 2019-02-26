
//Generate classroom buttons immediately
Template.reportsSelection.rendered = function() {
    // show different report options
}

Template.reportsSelection.events({
    'click .option--static': function() {
        Router.go('staticReport')
    },
    'click .option--interactive': function() {
        Router.go('interactiveReport')
    },
    'click .option--timeline': function() {
        Router.go('timelineReport')
    },
    'click .option--heatmap': function() {
        Router.go('heatmapReport')
    },
    'click .option--student-histogram': function() {
        Router.go('histogramReport')
    },
})

Template.reportBackButton.events({
    'click .back-button': function() {
        history.go(-1)
    }
})