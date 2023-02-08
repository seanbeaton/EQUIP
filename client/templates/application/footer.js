Template.footer.rendered = function () {
  const copyright_span = document.getElementsByClassName('current-year-copyright');
  if (copyright_span) {
    copyright_span[0].innerHTML = new Date().getFullYear();
  }
}
