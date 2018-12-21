
//Generate classroom buttons immediately
Template.interactiveReportView.rendered = function() {
    // show different report options
}

Template.interactiveReportView.events({

})


Template.interactiveReportView.helpers({
    discourseDimensions: function() {
        let discParams = SequenceParameters.find({envId: Router.current().params._envId}).fetch()
        console.log('demo', discParams);
        return discParams
    },
    demographics: function() {
        let demos = SubjectParameters.find({envId: Router.current().params._envId}).fetch();
        console.log('demo', demos);
        return demos
    },
    environment: function() {
        return Environments.find({_id: Router.current().params._envId})
    }
})

