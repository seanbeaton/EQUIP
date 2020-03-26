export let console_log_conditional = function() {
  if (typeof window === 'undefined' || // server side
    (typeof window.equip_show_logging !== 'undefined' && window.equip_show_logging)) { // client side
    console.log.apply(console, arguments);
  }
  return arguments[0]
}

export let console_table_conditional = function() {
  if (typeof window === 'undefined' || // server side
    (typeof window.equip_show_logging !== 'undefined' && window.equip_show_logging)) { // client side
    console.table.apply(console, arguments);
  }
  return arguments[0]
}