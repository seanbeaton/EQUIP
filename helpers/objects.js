function clone_object(obj) {
  if (null == obj || "object" !== typeof obj) return obj;
  let copy = obj.constructor();
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
}

export {clone_object};