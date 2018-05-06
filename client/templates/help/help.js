import Siema from 'siema';


Template.help.rendered = function() {
    const help = document.querySelector(".js-help-carousel");
    const helpSiema = new Siema({
        selector: help,
        loop: true
    });

    const customize = document.querySelector(".js-customize-carousel");
    const customizeSiema = new Siema({
        selector: customize,
        loop: true
    });

    const observe= document.querySelector(".js-observe-carousel");
    const observeSiema = new Siema({
        selector: observe,
        loop: true
    });

    const modal = document.getElementById("seq-data-modal");
    const hash = window.location.hash;

    if (modal) { modal.classList.remove("is-active"); }
    if (hash) {
        $("html, body").animate({ scrollTop: $(hash).offset().top }, 1000);
    }
}
