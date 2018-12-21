
Template.interactiveReportOptions.rendered = function() {
    // show different report options
    // 'environments':
}

const envSet = new ReactiveVar(false);
const obsOptions = new ReactiveVar([]);

Template.interactiveReportOptions.helpers({
    environments: function() {
        return Environments.find();
    },
    environmentChosen: function() {
        return envSet.get();
    },
    observationsExist: function() {
        console.log('checked if observations exist');
        return obsOptions.get().length !== 0
    },
    observations: function() {
        // console.log('obsOptions', obsOptions);
        return obsOptions.get()
    }
});

Template.interactiveReportOptions.events({
    'click .option--environment': function(e) {
        $('.report-section--select--obs.inactive').removeClass('inactive');
        let $target = $(e.target);
        if (!$target.hasClass('selected')) {
            $('.option--environment').removeClass('selected');
            $target.addClass('selected');
        }
        envSet.set(false);
        envSet.set(true);
        obsOptions.set([]);
        obsOptions.set(getObsOptions());
        console.log('obs options get', obsOptions.get());
        envSet.set(!!getCurrentEnvId());

    },
    'click .option--observation': function(e) {
        console.log('e.target', e.target);
        Router.go('interactiveReportView', {_obsId: $(e.target).attr('data-obs-id')})
    }
});

let getObsOptions = function() {
    console.log('getting obs options');
    let envId = getCurrentEnvId();
    console.log('getting obs options, envId', envId);
    if (!!envId) {
        let obs = Observations.find({envId: envId}).fetch();
        console.log('obs options', obs);
        return obs;
    }
    else {
        console.log('no obs options');

        return false;
    }
}

let getCurrentEnvId = function() {
    let selected = $(".option--environment.selected");
    console.log('getting current env id', selected.attr('data-env-id'));

    if (selected.length !== 0) {
        console.log('returning env id')
        return selected.attr('data-env-id');
    }
    else {
        console.log('returning undef')
        return false
    }
}