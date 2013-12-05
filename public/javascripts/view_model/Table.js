function Table(delete_url) {
  this.delete_url = delete_url;
}

Table.prototype.delete = function(callback, opt_event) {
  manager.confirm_dialog.show(this.confirm_text(), opt_event, function(delete_it) {
    if (delete_it) {
      var svc = service.getInstance();
      svc.delete(this.delete_url + '?id=' + this.id(), function(result) {
        if (result.err) {
          if (callback) callback(result);
        } else {
          if (callback) callback(result);
        }
      });
    } else {
      if (callback) callback();
    }
  }.bind(this));
};

function TableList(load_url, model_key) {
  this.list = ko.observableArray([]);
  this.load_url = load_url;
  this.model_key = model_key;
}

TableList.prototype.load = function() {
  this.list([]);
  var svc = service.getInstance();
  svc.get(this.load_url, this.load_.bind(this));
  return this;
};

TableList.prototype.load_ = function(result) {
  result[this.model_key].forEach(function(model) {
    this.list.push(this.build_object_(model));
  }.bind(this));
};

TableList.prototype.filterByKey = function(key, value) {
  return ko.utils.arrayFilter(this.list(), function(item) {
    return item[key]() == value;
  });
};

TableList.prototype.getById = function(id) {
  return ko.utils.arrayFirst(this.list(), function(item) {
    return item.id() == id;
  }.bind(this));
};
