Template.help.rendered = function () {
  $('.js-help-carousel').slick({
    arrows: true,
    dots: true
  });

  $('.js-customize-carousel').slick({
    arrows: true,
    dots: true
  });

  $('.js-observe-carousel').slick({
    arrows: true,
    dots: true
  });

  const modal = document.getElementById("seq-data-modal");
  const helpModal = document.getElementById("onboarding-modal");
  const hash = window.location.hash;

  if (modal) {
    modal.classList.remove("is-active");
  }
  if (helpModal) {
    helpModal.classList.remove("is-active");
  }

  if (hash) {
    $("html, body").animate({scrollTop: $(hash).offset().top}, 1000);
  }
}
