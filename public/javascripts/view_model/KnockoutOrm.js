function orm() { }

// Table Management
orm.table = function(context_base, table_name, model_key, url, columns) {
  this.context_base = context_base;
  this.table_name = table_name;
  this.model_key = model_key;
  this.url = url;
  this.columns = columns;
  this.joins = [];
  this.list = context_base[model_key + 's'];

  Object.keys(this.columns).forEach(function(column_name) {
    var column_def = this.columns[column_name];
    if (column_def['type'] === 'reference') {
      column_def['reference_table'].joins.push({
        table: this,
        column_name: column_name
      });
    }
  }.bind(this));
};

orm.table.prototype.create = function(data, callback) {
  var url = this.url;
  var svc = service.getInstance();

  var svc_data = {};

  Object.keys(this.columns).forEach(function(column_name) {
    if (column_name in data) {
      if (ko.isObservable(data[column_name])) {
        svc_data[column_name] = data[column_name]();
      } else {
        svc_data[column_name];
      }
    }
  });

  if (ko.isObservable(data['id'])) {
    svc_data['id'] = data['id']();
  } else {
    svnc_data['id'] = data['id'];
  }

  svc.post(url, function(result_code, result) {
    if (result_code == 200) {
      var model = result[this.model_key];
      var row = new orm.table.row(this, model);

      try {
        this.list.insert(row);
      } catch (err) {
        return callback(err, row);
      };

      callback(null, row);
    } else if (result_code == 304) {
      var row = this.list.get(result[this.model_key].id);
      callback(null, row);
    } else {
      callback(result_code, result);
    }
  }.bind(this), svc_data);
};

orm.table.prototype.delete = function(id, callback) {
  var svc = service.getInstance();
  var url = this.url + '?id=' + id;
  svc.delete(url, function(result_code, result) {
    if (result_code == 200) {
      var row = this.list.delete(id);
      if (callback) callback(null, row);
    } else if (result_code == 304) {
      if (callback) callback(new Error('Already Deleted', result));
    } else {
      if (callback) callback(result_code, result);
    }
  }.bind(this));
};

orm.table.prototype.get = function(id, callback) {
  var svc = service.getInstance();
  var url = this.url + '?id=' + id;
  svc.get(url, function(result_code, result) {
    if (result_code == 200 || result_code == 304) {
      var model =  result[this.model_key];
      var row = new orm.table.row(this, model);
      this.list.insert(row);
      callback(null, row);
    } else {
      callback(result_code, result);
    }
  }.bind(this));
};

orm.table.prototype.load = function(callback) {
  var svc = service.getInstance();
  svc.get(this.url, function(result_code, result) {
    if (result_code == 200) {
      this.list.clear();
      var model_key = 'all_' + this.model_key + 's';

      if (result[model_key]) {
        var list_model = [];
        result[model_key].forEach(function(model) {
          list_model.push(new orm.table.row(this, model));
        }.bind(this));
        this.list.set(list_model);
        callback(null, list_model);
      } else {
        callback(new Error('no_result', {model_key: this.model_key, error: result.toString()}))
      }
    } else if (result_code = 304) {
      callback(null, this.list);
    } else {
      callback(result_code, result);
    }
  }.bind(this));
};

// View Model Row.
orm.table.row = function(table, model) {
  this.table = table;
  this.id = ko.observable(model.id);

  Object.keys(this.table.columns).forEach(function(column_name) {
    var column_def = this.table.columns[column_name];

    this[column_name] = ko.observable(model[column_name]);

    if (column_def['type'] === 'reference') {
      var reference_table = column_def['reference_table'];
      this[reference_table.table_name] = ko.computed(function() {
        return reference_table.list.get(this[column_name]());
      }.bind(this));

      var reference_row = reference_table.list.get(this[column_name]());

      if (reference_row) {
        reference_row.addJoins(this.table, column_name);
      }
    }
  }.bind(this));

  this.table.joins.forEach(function(join) {
    this.addJoins(join[table], join[column_name]);
  }.bind(this));
};

orm.table.row.prototype.addJoins = function(join_table, join_column) {
  var accessor = join_table.table_name + 'List';

  if (!this[accessor]) {
    this[accessor] = ko.computed(function() {
      var filter = {};
      filter[join_column] = this.id();
      return join_table.list.find(filter);
    }.bind(this));
  }
};

// List management.
// This should all be synchronous.
orm.table.list = function(table_name) {
  this.table_name = ko.observable(table_name);
  this.list = ko.observableArray([]);
};

orm.table.list.prototype.length = function() {
  return this.list().length;
};

orm.table.list.prototype.get = function(id) {
  return ko.utils.arrayFirst(this.list(), function(item) {
    return item.id() == id;
  }.bind(this));
};

orm.table.list.prototype.find = function(filter) {
  if (filter == null) {
    return this.list();
  }

  var filter_function = filter;
  if (typeof(filter) == 'object') {
    filter_function = function(row) {
      return Object.keys(filter).map(function(column_name) {
        return row[column_name]() == filter[column_name];
      }).reduce(function(prev, curr) {
        return prev && curr;
      }, true);
    }
  } else if (typeof(filter) != 'function') {
    throw new Error('Invalid filter specified');
  }

  return this.list().filter(filter_function);
};

orm.table.list.prototype.set = function(list_model) {
  this.list(list_model);
};

orm.table.list.prototype.clear = function() {
  this.list.removeAll();
};

orm.table.list.prototype.insert = function(row, clobber) {
  if (this.get(row.id())) {
    if (clobber) {
      this.delete(row.id());
    } else {
      throw new Error('Row already exists');
    }
  }

  this.list.push(row);
};

orm.table.list.prototype.delete = function(id) {
  var rows = this.list.remove(function(row) {
    return row.id() == id;
  });

  if (rows.length > 1) {
    throw new Error('delete should remove zero or one row, not ' + rows.length);
  }

  return rows[0];
};

// The main entry point for defining a view model.
orm.define = function(context_base, table_name, definition, options) {
  options = options || {};
  var model_key = options['model_key'] || table_name;
  var url = options['url'] ? options['url'] : './' + table_name;
  var columns = {};

  Object.keys(definition).forEach(function(column_name) {
    columns[column_name] = definition[column_name];
  });

  context_base[model_key + 's'] = new orm.table.list(table_name);
  return new orm.table(context_base, table_name, model_key, url, columns);
};
