function Table() { }

Table.prototype.list = function() {
  var key = this.constructor.model_key + 's';
  return manager[key];
};

Table.prototype.delete = function(callback, opt_event) {
  manager.confirm_dialog.show(this.confirm_text(), opt_event, function(delete_it) {
    if (delete_it) {
      var svc = service.getInstance();
      var url = this.constructor.service_url + '?id=' + this.id();
      svc.delete(url, function(result_code, result) {
        if (result_code == 200 || result_code == 304) {
          var list_key = this.constructor.list_key;
          var model_key = this.constructor.model_key;
          manager[list_key].deleteById(result[model_key].id);
        }
        if (callback) callback(result_code, result);
      }.bind(this));
    } else {
      if (callback) callback(); //XXX This needs fleshing out.
    }
  }.bind(this));
};

Table.prototype.updateModel_ = function(model_result) {
  this.constructor.columns.forEach(function(column) {
    if (this[column]() != model_result[column]) {
      this[column](model_result[column]);
    }
  }.bind(this));
};

Table.prototype.update = function() {
  var data = {};
  var callback;
  var url = this.constructor.service_url;

  for(var i=0; i < arguments.length; i++) {
    if (typeof(arguments[i]) === 'object') {
      data = arguments[i];
    } else if (typeof(arguments[i]) === 'string') {
      url = url + '/' + arguments[i];
    } else if (typeof(arguments[i]) === 'function') {
      callback = arguments[i];
    } else {
      throw new Error('Unrecognized argument ' + arguments[i] + '(' + typeof(arguments[i]) + ')');
    }
  }

  data['id'] = this.id();
  if (! callback ) throw new Error('No callback provided');

  var svc = service.getInstance();
  var model_key = this.constructor.model_key;
  svc.put(url, function(result_code, result) {
    if (result_code == 200 || result_code == 304) {
      this.updateModel_(result[model_key]);
    }
    callback(result_code, result);
  }.bind(this), data);
};

Table.prototype.refresh = function(callback) {
  var svc = service.getInstance();
  var url = this.constructor.service_url + '?id=' + this.id();
  var model_key = this.constructor.model_key;
  svc.get(url, function(result_code, result) {
    if (result_code == 200 || result_code == 304) {
      this.updateModel_(result[model_key]);
    }
    callback(result_code);
  }.bind(this));
};

function TableList(model_type) {
  this.list = ko.observableArray([]);
  this.model_type = model_type;
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

TableList.prototype.create = function() {
  var data, callback;
  var url = this.model_type.service_url;

  for(var i=0; i < arguments.length; i++) {
    if (typeof(arguments[i]) === 'object') {
      data = arguments[i];
    } else if (typeof(arguments[i]) === 'string') {
      url = url + '/' + arguments[i];
    } else if (typeof(arguments[i]) === 'function') {
      callback = arguments[i];
    } else {
      throw new Error('Unrecognized argument ' + arguments[i] + '(' + typeof(arguments[i]) + ')');
    }
  }

  if (! data ) throw new Error('No data provided');
  if (! callback ) throw new Error('No callback provided');

  var svc = service.getInstance();
  svc.post(url, function(result_code, result) {
    if (result_code == 200 || result_code == 304) {
      var model_result = result[this.model_type.model_key];
      var model = this.build_object_(model_result);
      this.insert(model);

      if ('song_ratings' in result) {
        result.song_ratings.forEach(function(rating) {
          var model = manager.song_ratings.build_object_(rating);
          manager.song_ratings.insert(model);
        });
      }
    }
    callback(result_code, result);
  }.bind(this), data);
};

TableList.prototype.sort_types = function() {
  return this.sort_compare_labels.sort(function(a, b) {
    if (a.label > b.label) return 1;
    if (a.label < b.label) return -1;
    return 0;
  });
};

TableList.prototype.applyFilters = function(item) {
  for(var i=0; i < this.filter_order.length; i++) {
    var filter = this.filter_list[this.filter_order[i]];
    if (!filter(item)) return false;
  }
  return true;
};

TableList.prototype.set_sort_compare_list = function() {
  this.sort_compare_list = {__default: function(a, b) { return 0; }};
  this.sort_compare_labels = ko.observableArray([]);
};

TableList.prototype.set_filter_list = function() {
  this.filter_values = {};
  this.filter_list = {
    __default: function(item) { return true; }
  };
  this.filter_order = ['__default'];
};

TableList.prototype.load = function() {
  this.clear();
  var svc = service.getInstance();
  svc.get(this.model_type.service_url, this.load_.bind(this));
  return this;
};

TableList.prototype.load_ = function(result_code, result) {
  if (result_code != 200 && result_code != 304) {
    throw new Error('Table load got result_code ' + result_code);
  }
  var model_key = 'all_' + this.model_type.model_key + 's';
  if (! result[model_key]) {
    throw new Error('Table load got no result for ' + model_key + ' result = "' + result.toString() + '"');
  }
  var list_model = [];
  result[model_key].forEach(function(model) {
    list_model.push(this.build_object_(model));
  }.bind(this));
  this.list(list_model);
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

TableList.prototype.deleteById = function(id) {
  return this.list.remove(function(row) {
    return row.id() == id;
  });
};

TableList.prototype.clear = function() {
  return this.list.removeAll();
};

TableList.prototype.insert = function(model) {
  this.list.push(model);
};

TableList.prototype.insertNew = function(model) {
  this.insert(this.build_object_(model));
};

TableList.prototype.insertList = function(model_list) {
  model_list.forEach(function(model) {
    this.insertNew(model);
  }.bind(this));
};
