/*
* JS file for layout.html
*/
Template.header.rendered = function() {
    closeModal();
}


function closeModal() {
    let closeButton = document.querySelectorAll(".modal-close");
    let modalBackground = document.querySelectorAll(".modal-background");
    let modal = document.getElementById("onboarding-modal");

    closeButton.forEach((btn)=> {
        btn.addEventListener("click", (e) => {
            modal.classList.remove("is-active");
        });
    })

    modalBackground.forEach((bg) => {
        bg.addEventListener("click", (e) => {
            modal.classList.remove("is-active");
        });
    })
}
