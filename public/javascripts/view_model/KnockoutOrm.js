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
  this.reftables = {};
  this.last_error = null;

  Object.keys(this.columns).forEach(function(column_name) {
    var column_def = this.columns[column_name];
    if (column_def['type'] === 'reference') {
      var reftable = column_def['reference_table'];
      reftable.joins.push({
        table: this,
        column_name: column_name
      });
      this.reftables[reftable.table_name] = reftable;
    }
  }.bind(this));

  this.computes = computes || [];
};

orm.table.prototype.dispose = function() {
  this.disposeForm();
  this.last_error = null;
  this.reftables = null;
  this.list.dispose();
  delete context_base[this.model_key + 's'];
  this.list = null;
  this.joins = null;
  this.columns = null;
  this.url = null;
  this.model_key = null;
  this.table_name = null;
  this.context_base = null;
};

orm.table.prototype.deleteRowById = function(id) {
  var row = this.list.get(id);

  row.child_joins.forEach(function(child_list) {
    child_list().forEach(function(child_row) {
      child_row.table.deleteRowById(child_row.id());
    });
  })

  return this.list.delete(id);
};

orm.table.prototype.addOrUpdate = function(model, callback) {
  var row = this.list.get(model.id);

  if (row) {
    row.updateFromModel(model);
  } else {
    row = new orm.table.row(this, model);

    try {
      this.list.insert(row);
    } catch(e) {
      return callback(err, row);
    }
  }

  return(null, row);
};

orm.table.prototype.handleSubkeys_ = function(result, callback) {
  var result_err;
  Object.keys(result).forEach(function(sub_model_key) {
    if (result_err) return;
    if (sub_model_key == this.model_key) return;
    if (sub_model_key in this.context_base) {
      var sub_table_name = this.context_base[sub_model_key].table_name;
      if (ko.isObservable(sub_table_name)) sub_table_name = sub_table_name();
      var sub_table = this.context_base[sub_table_name];

      if (Array.isArray(result[sub_model_key])) {
        result[sub_model_key].forEach(function(sub_model) {
          sub_table.addOrUpdate(sub_model, function(err, row) {
            result_err = err;
          });
        });
      } else {
        sub_table.addOrUpdate(result[sub_model_key], function(err, row) {
          result_err = err;
        });
      }
    }
  }.bind(this));

  callback(result_err);
};

orm.table.prototype.buildSvcData_ = function(data) {
  var svc_data = {};

  if (data['id']) {
    if (ko.isObservable(data['id'])) {
      if (data['id']()) svc_data['id'] = data['id']();
    } else {
      svc_data['id'] = data['id'];
    }
  }

  Object.keys(this.columns).forEach(function(column_name) {
    if (column_name in data) {
      var value;
      if (ko.isObservable(data[column_name])) {
        value = data[column_name]();
      } else {
        value = data[column_name];
      }

      if (value != null) svc_data[column_name] = value;
    }
  });

  return svc_data;
};

orm.table.prototype.buildUrl_ = function(url_params) {
  var url = this.url;

  if (url_params) {
    url = url + '/' + url_params.join('/');
  }

  return url;
};

orm.table.prototype.create = function(data, callback, url_params) {
  var url = this.buildUrl_(url_params);
  var svc = service.getInstance();
  var svc_data = this.buildSvcData_(data);

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

      this.handleSubkeys_(result, function(err) {
        if (err) return callback(err);
        return callback(null, row);
      });
    } else if (result_code == 304) {
      var row = this.list.get(result[this.model_key].id);
      row.updateFromModel(result[this.model_key]);
      return callback(null, row);
    } else {
      return callback(result_code, result);
    }
  }.bind(this), svc_data);
};

orm.table.prototype.modify = function(data, callback, url_params) {
  var svc = service.getInstance();
  var url = this.buildUrl_(url_params);
  var svc_data = this.buildSvcData_(data);

  svc.put(url, function(result_code, result) {
    if (result_code == 200 || result_code == 304) {
      var row = this.list.get(result[this.model_key].id);
      row.updateFromModel(result[this.model_key]);
      this.handleSubkeys_(result, function(err) {
        if (err) return callback(err);
        return callback(null, row);
      });
    } else {
      return callback(result_code, result);
    }
  }.bind(this), svc_data);
};

orm.table.prototype.delete = function(id, callback) {
  var svc = service.getInstance();
  var url = this.url + '?id=' + id;
  svc.delete(url, function(result_code, result) {
    if (result_code == 200) {
      var row = this.deleteRowById(id);
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

orm.table.prototype.showForm = function(table, event, url) {
  this.form = new orm.table.form(table, url);
  this.form.show(event.pageX, event.pageY);
};

orm.table.prototype.disposeForm = function() {
  if (this.form) {
    this.form.dispose();
    this.form = null;
  }
};

// View Model Row.
orm.table.row = function(table, model) {
  this.table = table;
  this.id = ko.observable(model.id);
  this.child_joins = [];

  Object.keys(this.table.columns).forEach(function(column_name) {
    var column_def = this.table.columns[column_name];

    if (column_def['type'] === 'boolean') {
      this[column_name] = ko.observable(!!model[column_name]);
    } else if (column_def['type'] === 'reference' || column_def['type'] === 'integer') {
      var real_value = parseInt(model[column_name], 10);
      this[column_name] = ko.observable(real_value);
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

  this.testBind = ko.computed(function() {
    return "YO! " + this.toString();
  }.bind(this));
};

orm.table.row.prototype.addJoins = function(join_table, join_column) {
  var accessor = join_table.table_name + 'List';
  accessor = accessor.replace(/_(.)/g, function(match, p1) {
    return p1.toUpperCase();
  });

  if (!this[accessor]) {
    this[accessor] = ko.computed(function() {
      return ko.utils.arrayFilter(join_table.list.list(), function(join_row) {
        return join_row[join_column]() == this.id();
      }.bind(this));
    }.bind(this));

    this[accessor].views = {};
    Object.keys(join_table.views).forEach(function(view_name) {
      this[accessor].views[view_name] = join_table.views[view_name].cloneWithNewList(this[accessor]);
    }.bind(this));

    this.child_joins.push(this[accessor]);
  }

  var counter = accessor.replace(/List$/, 'Count');

  if (!this[counter]) {
    this[counter] = ko.computed(function() {
      return this[accessor]().length;
    }.bind(this));
  }
};

orm.table.row.prototype.dispose = function() {
  this.child_joins = null;
}; // It's possible columns need to be disposed in a particular order.

orm.table.row.prototype.updateFromModel = function(model) {
  Object.keys(this.table.columns).forEach(function(column_name) {
    if (column_name in model && model[column_name] !== this[column_name]()) {
      if (model[column_name] == '' && this[column_name]() == null) return;
      return this[column_name](model[column_name]);
    }
  }.bind(this));
};

orm.table.row.prototype.showForm = function(row, event, url) {
  this.table.form = new orm.table.form(this.table, url);
  this.table.form.show(event.pageX, event.pageY, this);
};

orm.table.row.prototype.modifyRow = function(row, event) {
  var target = event.target;
  var tagname = event.target.tagName.toLowerCase();

  if (tagname === 'input' || tagname === 'select' || 'value' in target) {
    var column_name = target.name;

    if (!column_name) {
      try {
        column_name = target.attributes.getNamedItem('name').value;
      } catch(e) {
        column_name = null;
      }
    }

    if (column_name) {
      var value = target.value;

      if (target.type === 'checkbox') value = target.checked;

      function handle_return(err, result) {
        if (err) {
          this.table.last_error = err;
        } else {
          this.table.last_error = null;
        }
      };

      var data = {id: row.id()};
      data[column_name] = value;
      this.table.modify(data, handle_return.bind(this));
    }
  }
};

orm.table.row.prototype.deleteRow = function(row, event, callback) {
  this.dialog = new orm.table.confirm_dialog('/confirm_dialog', this);
  this.dialog.show(event.pageX, event.pageY, function() {
    this.table.delete(this.id());
    this.dialog.dispose();
    this.dialog = null;
    if (callback) callback(null);
  }.bind(this), function() {
    this.dialog.dispose();
    this.dialog = null;
    if (callback) callback(new Error('Delete Cancelled'));
  }.bind(this));
};

orm.table.row.prototype.toString = function() {
  if (this.description) {
    return this.description();
  } else if (this.full_name) {
    return this.full_name();
  } else if (this.name) {
    return this.name();
  } else {
    var col_vals = [];

    Object.keys(this.table.columns).forEach(function(column_name) {
      col_vals.push(column_name + ': ' + this[column_name]());
    }.bind(this));

    return col_vals.join(', ');
  }
};

// Forms
orm.table.form = function(table, form_url) {
  this.table = table;
  this.url = form_url;
  this.message = ko.observable();
};

orm.table.form.prototype.show = function(x, y, row) {
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

  var url = this.url ? this.url : '/forms/' + this.table.table_name + '.html';
  var request = Ajax.getInstance().getRequest(url, 'document');
  request.get().then(function(form_html) {
    this.form_element = form_html.body.removeChild(form_html.body.firstChild);
    document.body.appendChild(this.form_element);
    ko.applyBindings(this, this.form_element);
    var d_body = this.form_element.querySelector('.dialog');
    d_body.style.top = y.toString() + 'px';
    d_body.style.left = x.toString() + 'px';
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
    var url_params = Array.prototype.map.call(
      this.form_element.querySelectorAll('input:not([data-bind])'),
      function(target) {
        var value = target.value;
        if (target.type === 'checkbox') value = target.checked;
        return value;
      }
    );
    this.table.create(this.row, handle_return.bind(this), url_params);
  }
};

orm.table.form.prototype.dispose = function() {
  document.body.removeChild(this.form_element);
};

orm.table.confirm_dialog = function(url, data) {
  this.url = url;
  this.data = data;
};

orm.table.confirm_dialog.prototype.show = function(x, y, confirm, reject) {
  this.confirm = confirm;
  this.reject = reject;

  var request = Ajax.getInstance().getRequest(this.url, 'document');
  request.get().then(function(dialog_html) {
    this.dialog_element = dialog_html.body.removeChild(dialog_html.body.firstChild);
    document.body.appendChild(this.dialog_element);
    ko.applyBindings(this, this.dialog_element);
    var d_body = this.dialog_element.querySelector('.dialog');
    d_body.style.top = y.toString() + 'px';
    d_body.style.left = x.toString() + 'px';
  }.bind(this)).fail(function(err) {
    throw err;
  });
};

orm.table.confirm_dialog.prototype.handleConfirm = function() {
  this.confirm();
};

orm.table.confirm_dialog.prototype.handleCancel = function() {
  this.reject();
};

orm.table.confirm_dialog.prototype.dispose = function() {
  document.body.removeChild(this.dialog_element);
  this.data = null;
  this.url = null;
  this.confirm = null;
  this.reject = null;
};

// List management.
// This should all be synchronous.
orm.table.list = function(table_name) {
  this.table_name = ko.observable(table_name);
  this.list = ko.observableArray([]);
};

orm.table.list.prototype.dispose = function() {
  while (this.list().length > 0) {
    var row = this.list.shift;
    row.dispose();
  }
  this.list = null;
  this.table_name = null;
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
        var filter_value = filter[column_name];
        if (ko.isObservable(filter_value)) filter_value = filter_value();
        return row[column_name]() == filter_value;
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
      if (item[column_name]() == null) return false;
      return item[column_name]().toLowerCase().match(this.filter_value().toLowerCase());
    }.bind(filter, column_name));
  } else if (filter_type === 'min') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = parseInt(item[column_name](), 10);
      var filter_value = parseInt(this.filter_value(), 10);
      return value >= filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'min_float') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = item[column_name]();
      var filter_value = this.filter_value();
      return value >= filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'max') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = parseInt(item[column_name](), 10);
      var filter_value = parseInt(this.filter_value(), 10);
      return value <= filter_value;
    }.bind(filter, column_name));
  } else if (filter_type === 'max_float') {
    filter.setCompare(function(column_name, item) {
      if (this.filter_value() == null || this.filter_value() === '') return true;
      var value = item[column_name]();
      var filter_value = this.filter_value();
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
      if (this.filter_value() === 'false') return ! item[column_name]();
      if (this.filter_value() === 'true') return !! item[column_name]();
      return item[column_name]() === this.filter_value();
    }.bind(filter, column_name));
  } else if (filter_type === 'bool') {
    filter.setCompare(function(column_name, item) {
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
orm.table.view = function(table_or_list, filters, sorts) {
  var list = table_or_list instanceof orm.table ? table_or_list.list : table_or_list;

  this.createSortAndFilters_(list, filters, sorts);

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
