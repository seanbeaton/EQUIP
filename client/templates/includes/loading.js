
let percent_loaded = new ReactiveVar(0);

Template.loading.helpers({
  percent_loaded: function() {
    if (percent_loaded.get()) {
      return percent_loaded.get()
    }
    return 0
  }
})

Template.loading.onRendered(function() {
  setInterval(function() {
    let pct_loaded = percent_loaded.get()
    let added_amount = 2;
    if (pct_loaded > 80) {
      added_amount = 1;
    }
    if (pct_loaded > 95) {
      return
    }
    let loading_factor = 25 / Math.max(pct_loaded, 1) + added_amount;
    percent_loaded.set(pct_loaded + Math.floor(Math.random() * loading_factor))
  }, 200)
})