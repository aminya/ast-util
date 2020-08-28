(function get(object, property, receiver) {
  const desc = Object.getOwnPropertyDescriptor(object, property);
  if (desc === void 0) {
    const parent = Object.getPrototypeOf(object);
    if (parent === null) {
      return void 0;
    } else {
      return get(parent, property, receiver);
    }
  } else if ('value' in desc && 'writable' in desc) {
    return desc.value;
  } else {
    const getter = desc.get;
    if (getter === void 0) {
      return void 0;
    }
    return getter.call(receiver);
  }
});
