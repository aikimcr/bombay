
/*
 * Assorted utilities
 */
 
exports.obj_merge = function(a, b) {
  var result = {};
  Object.keys(a).forEach(function (key) {
    var a_value = a[key];
    
    if (key in b) {
      var b_value = b[key];
      if (a_value === Object(a_value) && b_value === Object(b_value)) {
        result[key] = exports.obj_merge(a_value, b_value);
      } else {
        result[key] = b_value;
      }
    } else {
      result[key] = a_value;
    }
  });
  
  Object.keys(b).forEach(function(key) {
      if (!(key in result)) {
        result[key] = b[key];
      }
  });
  
  return result;
};
