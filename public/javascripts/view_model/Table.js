function Table() {
}

function TableList(load_url, model_key) {
  this.list = ko.observableArray([]);
  this.load_url = load_url;
  this.model_key = model_key;
}

TableList.prototype.load = function() {
  var svc = service.getInstance();
  svc.get(this.load_url, this.load_.bind(this));
  return this;
};

TableList.prototype.load_ = function(result) {
  result[this.model_key].forEach(function(model) {
    this.list.push(this.build_object_(model));
  }.bind(this));
};
