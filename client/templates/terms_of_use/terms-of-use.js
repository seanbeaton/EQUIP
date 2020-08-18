Template.terms.rendered = function () {
  const hash = window.location.hash;
  if (hash) {
    $("html, body").animate({scrollTop: $(hash).offset().top}, 1000);
  }
}
