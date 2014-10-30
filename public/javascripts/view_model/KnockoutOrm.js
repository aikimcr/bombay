function orm() { }

// Table Management
orm.table = function(context_base, table_name, model_key, url, columns, computes) {
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

  this.computes = computes || [];
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

  if (data['id']) {
    if (ko.isObservable(data['id'])) {
      if (data['id']()) svc_data['id'] = data['id']();
    } else {
      svc_data['id'] = data['id'];
    }
  }

  callback = callback || function(err, row) { if (err) throw err; };

  svc.post(url, function(result_code, result) {
    if (result_code == 200) {
      var model = result[this.model_key];
      var row = new orm.table.row(this, model);

      try {
        this.list.insert(row);
      } catch (err) {
        return callback(err, row);
      };

      return callback(null, row);
    } else if (result_code == 304) {
      var row = this.list.get(result[this.model_key].id);
      return callback(null, row);
    } else {
      return callback(result_code, result);
    }
  }.bind(this), svc_data);
};

orm.table.prototype.modify = function(data, callback) {
  var svc = service.getInstance();
  var url = this.url;
  var svc_data = {};

  if (ko.isObservable(data['id'])) {
    svc_data['id'] = data['id']();
  } else {
    svc_data['id'] = data['id'];
  }

  Object.keys(this.columns).forEach(function(column_name) {
    if (column_name in data) {
      if (ko.isObservable(data[column_name])) {
        svc_data[column_name] = data[column_name]();
      } else {
        svc_data[column_name];
      }
    }
  });

  svc.put(url, function(result_code, result) {
    if (result_code == 200) {
      var row = this.list.get(result[this.model_key].id);
      Object.keys(this.columns).forEach(function(column_name) {
        if (result[this.model_key][column_name] && result[this.model_key][column_name] !== row[column_name]()) {
          row[column_name](result[this.model_key][column_name]);
        }
      }.bind(this));
      callback(null, row);
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

orm.table.prototype.showForm = function(table, event) {
  this.form = new orm.table.form(this);
  this.form.show();
};

orm.table.prototype.disposeForm = function() {
  this.form.dispose();
  this.form = null;
};

// View Model Row.
orm.table.row = function(table, model) {
  this.table = table;
  this.id = ko.observable(model.id);

  Object.keys(this.table.columns).forEach(function(column_name) {
    var column_def = this.table.columns[column_name];

    if (column_def['type'] === 'boolean') {
      this[column_name] = ko.observable(!!model[column_name]);
    } else {
      this[column_name] = ko.observable(model[column_name]);
    }

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
    this.addJoins(join['table'], join['column_name']);
  }.bind(this));

  function get_sum(details, column_name) {
    if (details) {
      return details.reduce(function(prev, curr) {
        return prev + curr[column_name]();
      }, 0);
    } else {
      return null;
    }
  }

  this.table.computes.forEach(function(def) {
    try {
      if ('parent' in def) {
        this[def.name] = ko.computed(function() {
          if (def.parent in this) {
            var parent = this[def.parent]();

            if (parent) {
              if (def.column_name in parent) {
                return parent[def.column_name]();
              } else {
                throw new Error(def.parent + ' has no ' + def.column_name + ' column');
              }
            } else {
              return null;
            }
          } else {
            throw new Error(this.table.table_name + ' has no parent ' + def.parent);
          }
        }.bind(this));
      } else if ('sum' in def) {
        this[def.name] = ko.computed(function() {
          if (this[def.sum]) {
            return get_sum(this[def.sum](), def.column_name);
          } else {
            return null;
          }
        }.bind(this));
      } else if ('average' in def) {
        return this[def.name] = ko.computed(function() {
          if (this[def.average]) {
            var details = this[def.average]();
            var sum = get_sum(details, def.column_name);
            return (details && details.length > 0) ? sum / details.length : 0;
          } else {
            return null;
          }
        }.bind(this));
      } else if ('crossref' in def) {
        return this[def.name] = ko.computed(function() {
          if (this[def.details]) {
            var details = this[def.details]();
            var crossref_row = def.crossref();
            if (details && crossref_row) {
              var result = ko.utils.arrayFilter(details, function(row) {
                return row[def.column_name]() === crossref_row.id();
              });

              if (result.length === 1) {
                return result[0];
              } else if (result.length === 0) {
                return null;
              } else {
                return result;
              }
            } else {
              return null;
            }
          } else {
            return null;
          }
        }.bind(this));
      } else if ('sub_join' in def) {
        return this[def.name] = ko.computed(function() {
          if (this[def.sub_join]) {
            var sub_join = this[def.sub_join]();
            if (sub_join) {
              var result = {};

              if (Array.isArray(sub_join)) {
                sub_join.forEach(function(detail_row) {
                  var join_list = detail_row[def.join_list]();
                  result[join_list.id()] = join_list;
                });
              } else {
                var join_list = sub_join[def.join_list]();
                join_list.forEach(function(detail_row) {
                  result[detail_row.id()] = detail_row;
                });
              }

              return Object.keys(result).map(function(key) {
                return result[key];
              });
            } else {
              return [];
            }
          } else {
            return null;
          }
        }.bind(this));
      } else if ('map' in def) {
        return this[def.name] = ko.computed(function() {
          return def.map[this[def.column_name]()];
        }.bind(this));
      } else if ('compute' in def) {
        return this[def.name] = ko.computed(function() {
          return def.compute(this);
        }.bind(this));
      }
    } catch (err) {
      var def_string = Object.keys(def).map(function(key) {
        return key + ': ' + def[key];
      }).join(', ');
      var err_string = err + ', compute def = { ' + def_string + ' }';
      console.log(err_string);
      throw new Error(err_string);
    }
  }.bind(this));
};

orm.table.row.prototype.addJoins = function(join_table, join_column) {
  var accessor = join_table.table_name + 'List';
  accessor = accessor.replace(/_(.)/g, function(match, p1) {
    return p1.toUpperCase();
  });

  if (!this[accessor]) {
    this[accessor] = ko.computed(function() {
      var filter = {};
      filter[join_column] = this.id();
      return join_table.list.find(filter);
    }.bind(this));

    this[accessor].views = {};
    Object.keys(join_table.views).forEach(function(view_name) {
      this[accessor].views[view_name] = join_table.views[view_name].cloneWithNewList(this[accessor]);
    }.bind(this));
  }

  var counter = accessor.replace(/List$/, 'Count');

  if (!this[counter]) {
    this[counter] = ko.computed(function() {
      return this[accessor]().length;
    }.bind(this));
  }
};

// Forms
orm.table.form = function(table) {
  this.table = table;
  this.message = ko.observable();
};

orm.table.form.prototype.show = function(row) {
  this.row = {};

  if (row) {
    this.button_text = 'Update';
    this.row['id'] = ko.observable(row['id']());
    Object.keys(this.table.columns).forEach(function(column_name) {
      this.row[column_name] = ko.observable(row[column_name]());
    }.bind(this));
  } else {
    this.button_text = 'Add';
    this.row['id'] = ko.observable();
    Object.keys(this.table.columns).forEach(function(column_name) {
      this.row[column_name] = ko.observable();
    }.bind(this));
  }

  var url = '/forms/' + this.table.table_name + '.html';
  var request = Ajax.getInstance().getRequest(url, 'document');
  request.get().then(function(form_html) {
    this.form_element = form_html.body.removeChild(form_html.body.firstChild);
    document.body.appendChild(this.form_element);
    ko.applyBindings(this, this.form_element);
  }.bind(this)).fail(function(err) {
    throw err;
  });
};

orm.table.form.prototype.submit = function(form) {
  function handle_return(err, result) {
    if (err) return this.message(err.toString());
    return this.table.disposeForm();
  };

  if(this.row['id']()) {
    this.table.modify(this.row, handle_return.bind(this));
  } else {
    this.table.create(this.row, handle_return.bind(this));
  }
};

orm.table.form.prototype.dispose = function() {
  document.body.removeChild(this.form_element);
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

// List sorting
orm.table.list.sort = function(list) {
  this.list = list instanceof orm.table.list ? list.list : list;
  this.sort_type = ko.observable();
  this.compare_list = {};
  this.compare_labels = [];

  this.getList = ko.computed(function() {
    if (this.sort_type()) {
      var compare = this.compare_list[this.sort_type()];

      if (compare) {
        return this.list().map(function(row) { return row; }).sort(compare);
      } else {
        return this.list();
      }
    } else {
      return this.list();
    }
  }.bind(this));
};

orm.table.list.sort.prototype.addCompare = function(name, label, compare) {
  var compare_function;

  function field_compare(row_a, row_b, column, direction) {
    direction = direction || 'asc';
    if (row_a[column]() < row_b[column]()) return direction == 'desc' ? 1 : -1;
    if (row_a[column]() > row_b[column]()) return direction == 'desc' ? -1 : 1;
    return 0;
  }

  if (typeof(compare) == 'string') {
    compare_function = function(row_a, row_b) {
      return field_compare(row_a, row_b, compare);
    };
  } else if (typeof(compare) == 'object') {
    compare_function = function(row_a, row_b) {
      var column = Object.keys(compare)[0];
      return field_compare(row_a, row_b, column, compare[column]);
    };
  } else if (typeof(compare) == 'function') {
    compare_function = compare;
  }

  this.compare_list[name] = compare_function;
  this.compare_labels.push({value: name, label: label});
  if (!this.sort_type()) this.sort_type(name);
};

orm.table.list.sort.prototype.labels = function() {
  return this.compare_labels;
};

orm.table.list.sort.prototype.setType = function(new_type) {
  this.sort_type(new_type);
};

// Filters
orm.table.list.filter = function(list) {
  this.list = list instanceof orm.table.list ? list.list : list;
  this.filter_compare = function(row) { return true; }.bind(this);
  this.active = ko.observable(false);
  this.filter_value = ko.observable();

  this.getList = ko.computed(function() {
    if (this.active()) {
      if (this.filter_value === null || this.filter_value === '') {
        this.clearFilterValue();
        return this.list();
      } else {
        return ko.utils.arrayFilter(this.list(), this.filter_compare);
      }
    } else {
      return this.list();
    }
  }.bind(this));
};

orm.table.list.filter.prototype.setCompare = function(filter_compare) {
  var old_active = this.active();
  this.active(false);
  this.filter_compare = filter_compare.bind(this);
  this.active(old_active);
};

orm.table.list.filter.prototype.setFilterValue = function(value) {
  this.filter_value(value);
  this.setActive(true);
};

orm.table.list.filter.prototype.clearFilterValue = function() {
  this.filter_value(null);
  this.setActive(false);
};

orm.table.list.filter.prototype.setActive = function(is_active) {
  this.active(is_active);
};

orm.table.list.filter.columnFilterFactory = function(list, filter_type, column_name, select_list, filter_map) {
  var filter = new orm.table.list.filter(list);
  var filter_compare;

  if (filter_type === 'match') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      return item[column_name]().toLowerCase().match(this.filter_value().toLowerCase());
    }.bind(filter, column_name));
  } else if (filter_type === 'min') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = parseInt(item[column_name](), 10);
      var filter_value = parseInt(this.filter_value(), 10);
      return value >= filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'max') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = parseInt(item[column_name](), 10);
      var filter_value = parseInt(this.filter_value(), 10);
      return value <= filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'integer') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = parseInt(item[column_name](), 10);
      var filter_value = parseInt(this.filter_value(), 10);
      return value === filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'equal') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      return item[column_name]() === this.filter_value();
    }.bind(filter, column_name));
  } else if (filter_type === 'bool') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = !! item[column_name]();
      var filter_value = !! this.filter_value();
      return value === filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'map') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      return item[column_name]() === this.filter_value();
    }.bind(filter, column_name));

    filter['select_list'] = ko.computed(function() {
      return ko.utils.arrayMap(Object.keys(filter_map), function(key) {
        return {value: key, label: filter_map[key]};
      }).sort(function(row_a, row_b) {
        if (row_a.label < row_b.label) return -1;
        if (row_a.label > row_b.label) return 1;
        return 0;
      });
    }.bind(this));
  } else if (filter_type === 'id') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      return item[column_name]() === this.filter_value();
    }.bind(filter, column_name));

    filter['select_list'] = ko.computed(function() {
      var row_list = select_list.row_list;
      if (row_list instanceof orm.table.list) row_list = row_list.list;
      return ko.utils.arrayMap(row_list(), function(row) {
        return {value: row['id'](), label: row[select_list.label_column]()};
      }).sort(function(row_a, row_b) {
        if (row_a.label < row_b.label) return -1;
        if (row_a.label > row_b.label) return 1;
        return 0;
      });
    }.bind(this));
  }

  return filter;
};

// Define table views
orm.table.view = function(table, filters, sorts) {
  this.createSortAndFilters_(table.list, filters, sorts);

  this.cloneWithNewList = function(new_list) {
    var new_view = Object.create(this);
    new_view.createSortAndFilters_(new_list, filters, sorts);
    return new_view;
  };
};

orm.table.view.prototype.createSortAndFilters_ = function(list, filters, sorts) {
  var filtered_list = list;
  this.filters = {};

  filters = filters || [];
  filters.forEach(function(def) {
    this.filters[def.name] = orm.table.list.filter.columnFilterFactory(
      filtered_list,
      def.type,
      def.column_name,
      def.select_list,
      def.map
    );
    filtered_list = this.filters[def.name].getList;
  }.bind(this));

  this.sort = new orm.table.list.sort(filtered_list);
  sorts = sorts || [{
    name: 'id_asc',
    label: 'Row ID (Lo-Hi)',
    definition: {id: 'asc'}
  }];

  sorts.forEach(function(def) {
    this.sort.addCompare(
      def.name,
      def.label,
      def.definition
    );
  }.bind(this));
};

orm.table.view.prototype.getList = function() {
  return this.sort.getList();
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

  var computes = options['computes'] || [];

  context_base[model_key + 's'] = new orm.table.list(table_name);
  var table_result = new orm.table(context_base, table_name, model_key, url, columns, computes);

  var default_view = new orm.table.view(table_result, options['filters'], options['sort']);
  table_result.views = {default: default_view};
  table_result.filters = default_view.filters;
  table_result.sort = default_view.sort;

  var views = options['views'] || [];

  views.forEach(function(def) {
    table_result.views[def.name] = new orm.table.view(table_result, def['filters'], def['sort']);
  });

  return table_result;
};
