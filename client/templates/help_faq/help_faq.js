Template.helpFaq.rendered = function() {
    let modal = document.getElementById("seq-data-modal");

    if (modal) {
        modal.classList.remove("is-active");
    }
}

Template.helpFaq.helpers({
  accordion: function() {
      return [
          {header: "ONE", copy: "accordion one content"},
          {header: "TWO", copy: "accordion two content"},
          {header: "THREE", copy: "accordion three content"},
          {header: "FOUR", copy: "accordion four content"},
          {header: "FIVE", copy: "accordion five content"}
      ]
  }
});

Template.helpFaq.events({
  'click .toggle-accordion': function(e) {
      e.preventDefault();
      var ele = e.target;

      if (ele.nodeName === "H2") {
          ele = ele.parentElement;
      }

      $(ele).next().toggleClass('show');
      $(ele).next().slideToggle(350);
    }
});
