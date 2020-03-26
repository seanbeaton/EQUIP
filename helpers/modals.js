import {console_log_conditional} from "./logging"

function createModal(title, content, id, active) {
  if (typeof active === 'undefined') {
    active = false
  }

  let modal = $('<div/>',{
    class: 'modal',
  })

  if (active) {
    modal.addClass('is-active')
  }

  if (typeof id !== 'undefined') {
    modal.id = id;
  }
  $('body').append(modal);

  modal.append($('<div/>', {
    class: 'modal-background'
  }));
  modal.append($(
    '    <div class="modal-card">\n' +
    '      <header class="modal-card-head">\n' +
    '        <p class="modal-card-title">' + title + '</p>\n' +
    '        <button id="help-close-modal" class="delete"></button>\n' +
    '      </header>\n' +
    '      <section class="modal-card-body">\n' +
    '      ' + content + '\n' +
    '      </section>\n' +
    '      <footer class="modal-card-foot">\n' +
    '        <a class="button cancel">Cancel</a>\n' +
    '      </footer>\n' +
    '    </div>'
  ))


  modal.find('.delete, .cancel').on('click', function(e) {
    e.stopPropagation();
    console_log_conditional('closing modal');
    modal.remove();
  });

  return modal
}

export {createModal}