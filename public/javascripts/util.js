function util() {}

util.removeAllChildren = function(element) {
  while(element.children.length > 0) {
    element.removeChild(element.firstChild);
  }
};

util.appendTextElement = function(parent, element_text) {
  if (parent) {
    var tmp = document.createElement('div');
    tmp.innerHTML = element_text;

    while(tmp.children.length > 0) {
      var element = tmp.removeChild(tmp.firstChild);
      parent.appendChild(element);
    }
  }
};

util.getBandSelector = function() {
  return document.querySelector('.band_selector select[name="band"]');
};

util.getBandId = function() {
  var band_selector = util.getBandSelector();
  if (band_selector) { return band_selector.value; }
  return null;
};

util.bind = function() {
  var fargs = [];

  for(var i=0;i<arguments.length;i++) {
    fargs.push(arguments[i]);
  }

  var f = fargs.shift();
  var thisObject = fargs.shift();
  return function() {
    for(var i=0;i < arguments.length;i++) {
      fargs.push(arguments[i]);
    }
    f.apply(thisObject, fargs, arguments);
  };
};