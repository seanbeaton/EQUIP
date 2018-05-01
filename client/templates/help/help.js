Template.help.rendered = function() {
    const  modal = document.getElementById("seq-data-modal");
    const hash = window.location.hash;

    if (modal) { modal.classList.remove("is-active"); }
    if (hash) {
        $("html, body").animate({ scrollTop: $(hash).offset().top }, 1000);
    }
}
