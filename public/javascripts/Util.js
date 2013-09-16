Util = function() {};

Util.removeAllChildren = function(element) {
  while(element.children.length > 0) {
    element.removeChild(element.firstChild);
  }
};

Util.appendTextElement = function(parent, element_text) {
  if (parent) {
    var tmp = document.createElement('div');
    tmp.innerHTML = element_text;

    while(tmp.children.length > 0) {
      var element = tmp.removeChild(tmp.firstChild);
      parent.appendChild(element);
    }

    delete(tmp);
  }
};

Util.getBandSelector = function() {
  return band_selector = document.querySelector('.band_selector select[name="band"]');
};

Util.getBandId = function() {
  var band_selector = Util.getBandSelector();
  if (band_selector) { return band_selector.value; }
  return null;
};

Util.bind = function() {
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
  }
};