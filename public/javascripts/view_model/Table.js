function Table(service_url) {
  this.service_url = service_url;
}

Table.prototype.update = function(data, callback) {
  var svc = service.getInstance();
  Object.keys(data).forEach(function(fn) {
    if (fn == 'id') return;
    var value = data[fn];
    if (value === false || value == 'false') value = 0;
    if (value === true || value == 'true') value = 1;
    data[fn] = value;
  });
  data['id'] = this.id();
  svc.put(this.service_url, function(result) {
    if (callback) callback(result);
  }.bind(this), data);
};

Table.prototype.delete = function(callback, opt_event) {
  manager.confirm_dialog.show(this.confirm_text(), opt_event, function(delete_it) {
    if (delete_it) {
      var svc = service.getInstance();
      svc.delete(this.service_url + '?id=' + this.id(), function(result) {
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
  this.sort_type = ko.observable('__default');
  this.set_sort_compare_list();
  this.set_filter_list();

  this.filtered_list = ko.computed(function() {
    var sort_compare = this.sort_compare_list[this.sort_type()];
    var filtered = ko.utils.arrayFilter(this.list(), function(item) {
      return this.applyFilters(item);
    }.bind(this));
    return filtered.sort(sort_compare);
  }.bind(this));
}

TableList.prototype.applyFilters = function(item) {
  for(var i=0; i < this.filter_order.length; i++) {
    var filter = this.filter_list[this.filter_order[i]];
    if (!filter(item)) return false;
  }
  return true;
};

TableList.prototype.set_sort_compare_list = function() {
  this.sort_compare_list = {__default: function(a, b) { return 0; }};
};

TableList.prototype.set_filter_list = function() {
  this.filter_values = {};
  this.filter_list = {
    __default: function(item) { return true; }
  };
  this.filter_order = ['__default'];
};

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
