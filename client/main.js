/*
* Top level JS file
*/

Template.body.events({
  'mouseup': function(e) {
    let menu_wrapper = $('.dropdown-wrapper');
    console.log('clickup', e.target, menu_wrapper.has(e.target));
    if ( !menu_wrapper.is(e.target) && menu_wrapper.has(e.target).length === 0) {
      menu_wrapper.removeClass('dropdown-wrapper--open');
      console.log('vdalid');
    }
  },


  'click .dropdown-wrapper': function(e) {
    $('.dropdown-wrapper').toggleClass('dropdown-wrapper--open')
  },
})