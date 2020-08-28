(function(array) {
  let index = 0;
  return {
    next() {
      if (index < array.length) {
        return {
          done: false,
          value: array[index++]
        };
      } else {
        return {
          done: true,
          value: void 0
        };
      }
    }
  };
});
