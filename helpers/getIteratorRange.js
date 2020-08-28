(function(iterator, index, begin, len) {
  if (index > begin) {
    throw new RangeError();
  }
  if (typeof len === "undefined") {
    len = Infinity;
  }

  const range = [], end = begin + len;
  while (index < end) {
    const next = iterator.next();
    if (next.done) {
      break;
    }
    if (index >= begin) {
      range.push(next.value);
    }
    index++;
  }

  return {
    range,
    index
  };
});
